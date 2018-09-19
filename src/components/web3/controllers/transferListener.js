import { getTokenContract } from '../contracts/token';
import { getSubscriptionContract } from '../contracts/subscription';
import { getDepositAddress } from '../contracts/deposit';
import { RESPONSE_STATUS_SUCCESS } from 'constants/messageStatuses';
import {WEB3_ACTION_NOTIFICATION_TRANSFER} from 'constants/messageActions';
import { ETHConfiguration } from 'configs/';
import { getCommonTransactionResponse } from '../responses';
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

        transferPending.on('data', (transaction, error) => {
            console.info(`On Transfer PENDING ${type}`);
            if (!error) {
                let userIdKey = getUserIdKey(type);

                transaction[Symbol.for('blocksChecked')] = 0;
                transaction[Symbol.for('checkTransaction')] = () => {};
                transaction[Symbol.for('transactionType')] = type;
                transaction[Symbol.for('userId')] = _.get(transaction, `returnValues.${userIdKey}`);
                transaction[Symbol.for('status')] = getCommonTransactionResponse(transaction, RESPONSE_STATUS_SUCCESS);
                if (!module.isTransactionExist(transaction)) {
                    this.notifyTransfersInProgress(transaction, RESPONSE_STATUS_SUCCESS);
                    module.transactions = transaction;
                }
            }
        }).on('error', console.error);

        transferLatest.on('data', (transaction, error) => {
            console.info(`On Transfer LATEST ${type}`, error);
            if (!error) {
                let userIdKey = getUserIdKey(type);

                transaction[Symbol.for('blocksChecked')] = 0;
                transaction[Symbol.for('checkTransaction')] = this.checkTransaction.bind(this, transaction);
                transaction[Symbol.for('transactionType')] = type;
                transaction[Symbol.for('userId')] = _.get(transaction, `returnValues.${userIdKey}`);
                transaction[Symbol.for('status')] = getCommonTransactionResponse(transaction, RESPONSE_STATUS_SUCCESS);
                module.updateTransactionMined = transaction;
            }
        }).on('error', console.error);
    }

    async checkTransaction(transaction) {
        const { transactionHash, blockHash, blockNumber } = transaction;
        let blocksChecked = transaction[Symbol.for('blocksChecked')];
        const transactionReceipt = await getTransactionReceipt(transactionHash);

        if (transactionReceipt) {
            const { blockHash: blockHashReceipt, blockNumber: blockNumberReceipt, status: statusReceipt } = transactionReceipt;

            if (!Number(statusReceipt)) {
                console.warn('transaction failed');
                module.removeTransaction(transaction);
                return false;
            }
            console.info('Blocks info:');
            console.log('blockHash', blockHash, blockHashReceipt);
            console.log('blockNumber', blockNumber, blockNumberReceipt);

            if (blockHash !== blockHashReceipt || blockNumber !== blockNumberReceipt) {
                transaction[Symbol.for('blocksChecked')] = 1;
            } else {
                transaction[Symbol.for('blocksChecked')] = ++blocksChecked;
            }

            transaction[Symbol.for('status')] = getCommonTransactionResponse(transaction);
            this.notifyTransfersInProgress(transaction, RESPONSE_STATUS_SUCCESS);

            if (blocksChecked === sufficientConfirmations) {
                console.info('TRANSACTION COMPLETE');
                module.removeTransaction(transaction);
            }
        }
    }

    notifyTransfersInProgress(transaction, status) {
        const response = {
            userId: transaction[Symbol.for('userId')],
            data: {
                status,
                command: WEB3_ACTION_NOTIFICATION_TRANSFER,
                response: transaction[Symbol.for('status')]
            }
        };

        module.sendResponseToClients(response);
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

function getUserIdKey(transactionType) {
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

    return userIdKey;
}