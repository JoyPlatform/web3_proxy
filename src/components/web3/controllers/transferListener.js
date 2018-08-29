import { getTokenContract } from '../contracts/token';
import { getSubscriptionContract } from '../contracts/subscription';
import { getDepositAddress } from '../contracts/deposit';
import { RESPONSE_STATUS_SUCCESS } from 'constants/messageStatuses';
import { WEB3_ACTION_NOTIFICATION_TRANSFER } from 'constants/messageActions';
import { ETHConfiguration } from 'configs/';
import _ from 'lodash';

let module = null;
const { sufficientConfirmations } = ETHConfiguration;
const DEPOSIT_TRANSACTION = 'DEPOSIT_TRANSACTION';
const WITHDRAWAL_TRANSACTION = 'WITHDRAWAL_TRANSACTION';
const SUBSCRIPTION_TRANSACTION = 'SUBSCRIPTION_TRANSACTION';

// getting notification about transactions from MetaMask
export default class TransferListenerController {

    constructor(baseModule) {
        module = baseModule;
        this.registerTransfers();
    }

    registerTransfers() {
        module.eth.getBlockNumber().then((fromBlock) => {
            this.getTransferEvent(DEPOSIT_TRANSACTION, fromBlock);
            this.getTransferEvent(WITHDRAWAL_TRANSACTION, fromBlock);
            this.getTransferEvent(SUBSCRIPTION_TRANSACTION, fromBlock);
        });
    }

    getTransferByType(type, fromBlock, toBlock) {
        let contract = null;

        switch (type) {
            case DEPOSIT_TRANSACTION:
                contract = getTokenContract(module.eth.Contract);
                return contract.events.Transfer({
                    filter: { to: getDepositAddress() },
                    fromBlock,
                    toBlock
                });
            case WITHDRAWAL_TRANSACTION:
                contract = getTokenContract(module.eth.Contract);
                return contract.events.Transfer({
                    filter: { from: getDepositAddress() },
                    fromBlock,
                    toBlock
                });
            case SUBSCRIPTION_TRANSACTION:
                contract = getSubscriptionContract(module.eth.Contract);
                return contract.events.newSubscription({
                    filter: {},
                    fromBlock,
                    toBlock
                });
            default:
                console.warn('getTransferByType: Unexpected Transfer type');
        }
    }

    getTransferEvent(type, fromBlock) {

        const transferPending = this.getTransferByType(type, fromBlock, 'pending');
        const transferLatest = this.getTransferByType(type, fromBlock, 'latest');

        transferPending.on('data', (data, error) => {
            console.info(`On Transfer PENDING ${type}`);
            if (!error) {
                data[Symbol.for('blocksChecked')] = 0;
                data[Symbol.for('checkTransaction')] = () => {};
                data[Symbol.for('transactionType')] = type;
                if (!module.isTransactionExist(data)) {
                    console.log('notifyTransfersInProgress');
                    this.notifyTransfersInProgress(data);
                    module.transactions = data;
                }
            }
        }).on('error', console.error);

        transferLatest.on('data', (data, error) => {
            console.info(`On Transfer LATEST ${type}`, error);
            if (!error) {
                data[Symbol.for('blocksChecked')] = 0;
                data[Symbol.for('checkTransaction')] = this.checkTransaction.bind(this, data);
                data[Symbol.for('transactionType')] = type;
                module.updateTransactionMined = data;
            }
        }).on('error', console.error);
    }

//TODO: need to re-develop
    getTransfersInProgress({request, response}) {
        const { clientId } = request;
        const transfers = [];
        const userTransactions = _.filter(module.transactions, (transaction) =>
            _.get(transaction, 'returnValues.from') === clientId || _.get(transaction, 'returnValues.to') === clientId
        );

        userTransactions.forEach((transaction) => {
            const { percentage, event } = transaction;
            transfers.push({
                percentage: percentage || 0,
                event
            });
        });

        response.data.response = transfers;
        response.data.status = RESPONSE_STATUS_SUCCESS;

        module.sendResponseToClient(response);
    }

    notifyTransfersInProgress(transaction) {
        const transactionType = transaction[Symbol.for('transactionType')];
        let userIdKey = null;

        switch (transactionType) {
            case DEPOSIT_TRANSACTION:
                userIdKey = 'from';
                break;
            case WITHDRAWAL_TRANSACTION:
                userIdKey = 'to';
                break;
            case SUBSCRIPTION_TRANSACTION:
                userIdKey = 'buyer';
                break;
            default:
                console.warn('notifyTransfersInProgress: Unexpected Transfer type');
        }

        const userId = _.get(transaction, `returnValues.${userIdKey}`);
        const response = getCommonTransactionResponse(transaction, userId);

        module.sendResponseToClients(response);
    }

    async checkTransaction(transaction, newBlockNumber) {
        const { transactionHash, blockHash, blockNumber } = transaction;
        let blocksChecked = transaction[Symbol.for('blocksChecked')];
        const transactionReceipt = await getTransactionReceipt(transactionHash);

        if (transactionReceipt) {
            const { blockHash:blockHashReceipt, blockNumber:blockNumberReceipt, status:statusReceipt } = transactionReceipt;

            if (!Number(statusReceipt)) {
                console.warn('transaction failed');
                module.removeTransaction(transaction);
                return false;
            }

            if (blockHash !== blockHashReceipt || blockNumber !== blockNumberReceipt) {
                transaction[Symbol.for('blocksChecked')] = 1;
            } else {
                transaction[Symbol.for('blocksChecked')] = ++blocksChecked;
            }

            this.notifyTransfersInProgress(transaction);

            if (blocksChecked === sufficientConfirmations) {
                console.info('TRANSACTION COMPLETE');
                module.removeTransaction(transaction);
            }

            console.log(blocksChecked, newBlockNumber);
            // this.notifyTransfersInProgress(transaction);
        }
    }

}

function getTransactionReceipt(transactionId) {
    return new Promise((resolve) => {
        module.eth.getTransactionReceipt(transactionId, (error, response) => {
            if (error) {
                resolve(false);
            } else {
                resolve(response);
            }
        });
    });
}


function getCommonTransactionResponse(transaction, userId) {
    return {
        userId,
        data: {
            status: RESPONSE_STATUS_SUCCESS,
            command: WEB3_ACTION_NOTIFICATION_TRANSFER,
            response: {
                event: transaction[Symbol.for('transactionType')],
                confNum: transaction[Symbol.for('blocksChecked')],
                confMax: sufficientConfirmations,
                transactionHash: transaction.transactionHash,
                userId
            }
        }
    };
}