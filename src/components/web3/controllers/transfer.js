import { getTokenContract } from '../contracts/token';
import { getDepositAddress } from '../contracts/deposit';
import { RESPONSE_STATUS_SUCCESS } from 'constants/messageStatuses';
import { WEB3_ACTION_NOTIFICATION_TRANSFER } from 'constants/messageActions';
import _ from 'lodash';

let module = null;

export default class TransferComponent {

    constructor(baseModule) {
        module = baseModule;
        this.registerTransfersToDeposits();
        this.registerTransfersToClient();
    }

    registerTransfersToDeposits() {
        const Token = getTokenContract(module.eth.Contract);

        module.eth.getBlockNumber().then((fromBlockNum) => {
            Token.events.Transfer({
                filter: { to: getDepositAddress() },
                fromBlock: fromBlockNum,
                toBlock: 'pending'
            }, (error, data) => {
                if (!data) {
                    console.warn('Can not get Data from Web3 in transfer to deposit');
                    return false;
                }
                console.info('** Transfer Event to depositContract:');
                console.info(data.event);
                data.notifyTransfersInProgress = this.notifyTransfersInProgress;
                data.percentage = 0;
                module.transactions = data;
                this.notifyTransfersInProgress(data);
            })
                .on('data', (data) => {
                    console.info('** data:');
                    if (!data) {
                        console.warn('Can not get Data from Web3 in transfer to deposit');
                        return false;
                    }
                    console.info(data.event);
                })
                .on('changed', (data) => {
                    console.warn('** changed:');
                    if (!data) {
                        console.warn('Can not get Data from Web3 in transfer to deposit');
                        return false;
                    }
                    console.warn(data);
                    // remove event from local database
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
        const response = getCommonTransactionResponse(transaction);

        response.clientId = _.get(transaction, 'returnValues.from');
        module.sendResponseToClients(response);
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
                data.notifyTransfersInProgress = this.notifyDepositInProgress;
                data.percentage = 0;
                module.transactions = data;
                this.notifyDepositInProgress(data);
            })
                .on('data', (data) => {
                    console.info('** data registerTransfersToClient:');
                    if (!data) {
                        console.warn('Can not get Data from Web3 in transfer to client');
                        return false;
                    }
                    console.info(data.event);
                })
                .on('changed', (data) => {
                    console.warn('** changed:');
                    if (!data) {
                        console.warn('Can not get Data from Web3 in transfer to client');
                        return false;
                    }
                    console.warn(data.event);
                    // remove event from local database
                })
                .on('error', console.error);
        });
    }

    notifyDepositInProgress(transaction) {
        const response = getCommonTransactionResponse(transaction);

        response.clientId = _.get(transaction, 'returnValues.to');
        module.sendResponseToClients(response);
    }

}

function getCommonTransactionResponse({ percentage, event }) {
    return {
        data: {
            status: RESPONSE_STATUS_SUCCESS,
            command: WEB3_ACTION_NOTIFICATION_TRANSFER,
            response: {
                percentage,
                event
            }
        }
    };
}