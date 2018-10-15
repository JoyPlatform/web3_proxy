import _ from 'lodash';
import { RESPONSE_STATUS_SUCCESS, RESPONSE_STATUS_ERROR } from 'constants/messageStatuses';
import { WEB3_ACTION_NOTIFICATION_TRANSFER } from 'constants/messageActions';
import {getCommonTransactionResponse} from 'components/web3/responses';
import { ETHConfiguration } from 'configs/';

const { sufficientConfirmations } = ETHConfiguration;
let transactionsList = {};
let module = null;

export default class TransferController {

    constructor(baseModule) {
        module = baseModule;
    }

    getTransactionStatus({request, response}) {
        let trCounter = 0;
        const { transactionHash, transactionsHash } = request;
        let transactions = transactionsHash;

        if (transactionHash) {
            transactions = [transactionHash];
        }
        response.data.response = [];

        transactions.forEach(async (transaction) => {
            const transactionReceipt = await getTransactionReceipt(transaction);
            const blocksChecked = module.currentBlockNumber - transactionReceipt.blockNumber;

            response.data.status = RESPONSE_STATUS_SUCCESS;
            response.data.response.push({
                status: Number(transactionReceipt.status) ? RESPONSE_STATUS_SUCCESS : RESPONSE_STATUS_ERROR,
                transactionHash: transaction,
                confNum: blocksChecked >= sufficientConfirmations ? sufficientConfirmations : blocksChecked,
                confMax: sufficientConfirmations
            });

            if (transactions.length === ++trCounter) {
                module.sendResponseToClient(response);
            }
        });
    }

    getTransfersInProgress({request, response}) {
        const { userIds } = request;
        const transactions = [];
console.info('getTransfersInProgress');
        _.forEach(this.transactions, (transaction) => {
            if (userIds.includes(transaction[Symbol.for('userId')])) {
                transactions.push(transaction[Symbol.for('status')]);
            }
        });

        response.data.status = RESPONSE_STATUS_SUCCESS;
        response.data.response = { transactions };
        response.data.response = { transactions };

        module.sendResponseToClient(response);
    }

    async checkTransaction(transaction, number) {
        transaction[Symbol.for('checking')] = true;
        const { transactionHash, blockHash, blockNumber } = transaction;
        const transactionReceipt = await getTransactionReceipt(transactionHash);

        if (transactionReceipt) {
            const { blockHash: blockHashReceipt, blockNumber: blockNumberReceipt, status: statusReceipt } = transactionReceipt;

            if (!Number(blockHash) && Number(blockHashReceipt)) {
                module.updateTransactionMined(Object.assign(transaction, {...transactionReceipt}));
                if (Number(statusReceipt)) {
                    transaction[Symbol.for('checking')] = false;
                    return;
                }
            }

            transaction.status = Number(statusReceipt);
            if (!Number(statusReceipt)) {
                console.warn('transaction failed');
                notifyTransfersInProgress(transaction);
                module.removeTransaction(transaction);
                return false;
            }

            if (blockHash !== blockHashReceipt || blockNumber !== blockNumberReceipt) {
                transaction[Symbol.for('blocksChecked')] = 1;
                module.updateTransactionMined(Object.assign(transaction, {...transactionReceipt}));
            } else {
                transaction[Symbol.for('blocksChecked')] = number - blockNumber;
            }

            transaction[Symbol.for('status')] = getCommonTransactionResponse(transaction);
            notifyTransfersInProgress(transaction);

            if (transaction[Symbol.for('blocksChecked')] === sufficientConfirmations) {
                console.info('TRANSACTION COMPLETE');
                module.removeTransaction(transaction);
            } else {
                transaction[Symbol.for('checking')] = false;
            }
        } else {
            transaction[Symbol.for('checking')] = false;
        }
    }

    checkTransactions(blockNumber) {
        let needToForceCheck = false;
        let index = 0;
        console.info('checkTransactions');
        _.forEach(this.transactions, (transaction) => {
            // typeof transaction[Symbol.for('checkTransaction')] === 'function' && transaction[Symbol.for('checkTransaction')](number);
            !transaction[Symbol.for('checking')] && this.checkTransaction(transaction, blockNumber);
            const diff = 50 + index / 20;

            if (!transaction[Symbol.for('blockDiff')]) {
                transaction[Symbol.for('blockDiff')] = diff;
            }

            needToForceCheck = blockNumber - transaction.blockNumber >= transaction[Symbol.for('blockDiff')];
            index++;
        });

        console.log('needToForceCheck', needToForceCheck);
    }

    removeTransaction({transactionHash}) {

        if (!_.isEmpty(transactionsList[transactionHash])) {
            delete transactionsList[transactionHash];
        }

    }

    isTransactionExist({transactionHash}) {
        return !_.isEmpty(transactionsList[transactionHash]);
    }

    set updateTransactionMined(transaction) {
        const { transactionHash } = transaction;

        if (!_.isEmpty(transactionsList[transactionHash])) {
            transactionsList[transactionHash] = transaction;
        }
    }

    set transactions(transaction) {
        const { transactionHash } = transaction;

        if (_.isEmpty(transactionsList[transaction])) {
            transactionsList[transactionHash] = transaction;
        }
        console.info('Transactions amount: ', Object.keys(transactionsList).length);
    }

    get transactions() {
        return transactionsList;
    }

}

function getTransactionReceipt(transactionId) {
    return new Promise((resolve) => {
        module.eth.getTransactionReceipt(transactionId).then((response) => {
            resolve(response);
        }).catch((e) => {
            resolve(false);
            console.error(e);
        });
    });
}

export function notifyTransfersInProgress(transaction) {
    const response = {
        userId: transaction[Symbol.for('userId')],
        data: {
            status: Number(transaction.status) ? RESPONSE_STATUS_SUCCESS : RESPONSE_STATUS_ERROR,
            command: WEB3_ACTION_NOTIFICATION_TRANSFER,
            response: transaction[Symbol.for('status')]
        }
    };

    module.sendResponseToClients(response);
}