import { getTokenContract } from '../contracts/token';
import { getDepositAddress } from '../contracts/deposit';
import { RESPONSE_STATUS_SUCCESS } from 'constants/messageStatuses';
import { WEB3_ACTION_NOTIFICATION_TRANSFER } from 'constants/messageActions';
import { ETHConfiguration } from 'configs/';
import _ from 'lodash';

let module = null;
const { sufficientConfirmations } = ETHConfiguration;

export default class TransferController {

    constructor(baseModule) {
        module = baseModule;
        this.registerTransfersToDeposits();
        this.registerTransfersToClient();
    }

    registerTransfersToDeposits() {
        const Token = getTokenContract(module.eth.Contract);

        module.eth.getBlockNumber().then((fromBlockNum) => {
            console.info('getBlockNumber');
            Token.events.Transfer({
                filter: { to: getDepositAddress() },
                fromBlock: fromBlockNum,
                toBlock: 'pending'
            }).on('data', (data, error) => {
                console.info('ON DATA Transfer:');
                console.log(data);
                if (!error) {
                    data[Symbol.for('blocksChecked')] = 0;
                    data[Symbol.for('checkTransaction')] = this.checkTransaction.bind(this, data);
                    console.log(data);
                    module.transactions = data;
                    this.notifyTransfersInProgress(data);
                }
            }).on('error', console.error);
        });
    }

    registerTransfersToClient() {
        const Token = getTokenContract(module.eth.Contract);

        module.eth.getBlockNumber().then((fromBlockNum) => {
            Token.events.Transfer({
                filter: { from: getDepositAddress() },
                fromBlock: fromBlockNum,
                toBlock: 'latest'
            }, (error, data) => {
                console.info('** Transfer Event to registerTransfersToClient:');
                if (!data) {
                    console.warn('Can not get Data from Web3 in transfer to client');
                    return false;
                }
                console.info(data);
                // data.notifyTransfersInProgress = this.notifyDepositInProgress;
                // data.percentage = 0;
                // module.transactions = data;
                // this.notifyDepositInProgress(data);
            }).on('data', (data, error) => {
                console.info('ON DATA DEPOSIT   :');
                console.log(data);
                console.log(error);
            })
                .on('error', console.error);
        });
    }

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
        const userId = _.get(transaction, 'returnValues.from');
        const response = getCommonTransactionResponse(transaction, userId);

        response.userId = userId;
        module.sendResponseToClients(response);
    }

    notifyDepositInProgress(transaction) {
        const response = getCommonTransactionResponse(transaction);

        response.userId = _.get(transaction, 'returnValues.to');
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
            }

            if (blockHash !== blockHashReceipt || blockNumber !== blockNumberReceipt) {
                transaction[Symbol.for('blocksChecked')] = 0;
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
                event: transaction.event,
                confNum: transaction[Symbol.for('blocksChecked')],
                confMax: sufficientConfirmations,
                userId
            }
        }
    };
}