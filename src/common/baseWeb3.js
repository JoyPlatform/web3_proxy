import Web3Service from 'communicationServices/web3';
import { ETHConfiguration } from 'configs/';
import _ from 'lodash';
import EventBus from 'common/EventBus';

const IPC_CONNECTION_CLOSED = 'Error: IPC socket connection closed';
const IPC_COULD_NOT_CONNECT = 'Error: CONNECTION ERROR: Couldn\'t connect to node on IPC.';
const CONNECTION_ERRORS = [IPC_CONNECTION_CLOSED, IPC_COULD_NOT_CONNECT];

let webServices = null;
let transactionsList = [];
const { sufficientConfirmations } = ETHConfiguration;

export default class BaseWeb3 {

    constructor() {
        this.connectionStatus = false;
        this.initWeb3Services();
    }

    initWeb3Services() {
        webServices = new Web3Service();

        const subscription = this.eth.subscribe('newBlockHeaders', (error, data) => {
            if (!error) {
                EventBus.emit('Web3ConnectionStatus', true);
                this.checkTransactions(data);
                this.updateTransactions();
            } else {
                this.connectionErrorHandling(subscription, error.toString());
            }
        });
    }

    connectionErrorHandling(subscription, error) {
        if (CONNECTION_ERRORS.values(error)) {
            EventBus.emit('Web3ConnectionStatus', false);
            if (IPC_COULD_NOT_CONNECT === error) {
                setTimeout(() => {
                    subscription.unsubscribe(function(error, success) {
                        if (success) {
                            console.log('Successfully unsubscribed!');
                        }
                    });
                    this.initWeb3Services();
                }, 5000);
            }
        }
    }

    checkTransactions({number}) {

        this.transactions.forEach((transaction) => {
            const { blockNumber } = transaction;

            const percentage = (number - blockNumber) * 100 / sufficientConfirmations;

            transaction.percentage = percentage < 100 ? percentage : 100;

            transaction.notifyTransfersInProgress(transaction);
        });

    }

    updateTransactions() {
        const filteredTransactionData = _.filter(this.transactions, transaction => transaction.percentage < 100);

        updateTransactionList(filteredTransactionData);
    }

    set transactions(transaction) {
        transactionsList.push(transaction);
    }

    get transactions() {
        return transactionsList;
    }

    get eth() {
        return webServices.web3.eth;
    }

    get web3() {
        return webServices.web3;
    }

    get utils() {
        return webServices.web3.utils;
    }

}

function updateTransactionList(filteredTransactionData) {
    transactionsList = filteredTransactionData;
    console.log('transactionsList amount', transactionsList.length);
}