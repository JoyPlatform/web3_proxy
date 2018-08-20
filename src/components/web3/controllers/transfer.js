import { getTokenContract } from '../contracts/token';
import { getDepositAddress } from '../contracts/deposit';
import { RESPONSE_STATUS_SUCCESS } from 'constants/messageStatuses';
import { WEB3_ACTION_NOTIFICATION_TRANSFER } from 'constants/messageActions';
import { ETHConfiguration } from 'configs/';
import _ from 'lodash';

let module = null;
const { sufficientConfirmations } = ETHConfiguration;
const DEPOSIT_TRANSACTION = 'DEPOSIT_TRANSACTION';
const WITHDRAWAL_TRANSACTION = 'WITHDRAWAL_TRANSACTION';

export default class TransferController {

    constructor(baseModule) {
        module = baseModule;
        this.registerTransfers();
    }

    registerTransfers() {
        module.eth.getBlockNumber().then((fromBlock) => {
            this.getTransferEvent(DEPOSIT_TRANSACTION, fromBlock);
            this.getTransferEvent(WITHDRAWAL_TRANSACTION, fromBlock);
        });
    }

    getTransferEvent(type, fromBlock) {
        const Token = getTokenContract(module.eth.Contract);
        const filterKey = type === DEPOSIT_TRANSACTION ? 'to' : 'from';

        Token.events.Transfer({
            filter: { [filterKey]: getDepositAddress() },
            fromBlock,
            toBlock: 'pending'
        }).on('data', (data, error) => {
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

        Token.events.Transfer({
            filter: { [filterKey]: getDepositAddress() },
            fromBlock,
            toBlock: 'latest'
        }).on('data', (data, error) => {
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
        const userIdKey = transactionType === DEPOSIT_TRANSACTION ? 'from' : 'to';

        const userId = _.get(transaction, `returnValues.${userIdKey}`);
        const response = getCommonTransactionResponse(transaction, userId);

        response.userId = userId;
        module.sendResponseToClients(response);
    }

    async checkTransaction(transaction, newBlockNumber) {
        const { transactionHash, blockHash, blockNumber } = transaction;
        let blocksChecked = transaction[Symbol.for('blocksChecked')];
        const transactionReceipt = await getTransactionReceipt(transactionHash);

        if (transactionReceipt) {
            const { blockHash:blockHashReceipt, blockNumber:blockNumberReceipt, status:statusReceipt } = transactionReceipt;

            if (!statusReceipt) {
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