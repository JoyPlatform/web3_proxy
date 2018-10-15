import Web3Service from 'communicationServices/web3';
import EventBus from 'common/EventBus';
import { ETHConfiguration } from 'configs/';

const IPC_CONNECTION_CLOSED = 'Error: IPC socket connection closed';
const IPC_COULD_NOT_CONNECT = 'Error: CONNECTION ERROR: Couldn\'t connect to node on IPC.';
const CONNECTION_ERRORS = [IPC_CONNECTION_CLOSED, IPC_COULD_NOT_CONNECT];

let webServices = null;
let currentBlockNumber = 0;
let gasPrice = 0;

export default class BaseWeb3 {

    constructor() {
        this.connectionStatus = false;
    }

    initWeb3Services() {
        return new Promise((resolve) => {
           this.connectToIPC(resolve);
        });
    }

    connectToIPC(resolve) {
        if (webServices === null) {
            webServices = new Web3Service();
        }

        this.eth.isSyncing().then((data) => {
            console.info('isSyncing', !!data);
            if (data) {
                setTimeout(() => {
                    this.connectToIPC(resolve);
                }, 30000);

                return false;
            }
            this.eth.subscribe('newBlockHeaders', (error, { number }) => {
                if (!error) {
                    resolve();
                    currentBlockNumber = number;
                    EventBus.emit('Web3ConnectionStatus', true);
                    EventBus.emit('Web3NewBlockHeaders', number);
                } else {
                    this.connectionErrorHandling(error.toString(), resolve);
                }
            });
        }).catch((error) => {
            console.error('isSyncing', error);
            this.connectionErrorHandling(error.toString(), resolve);
        });
    }

    connectionErrorHandling(error, resolve) {
        console.warn('Disconnected from ETH', error);
        if (CONNECTION_ERRORS.values(error)) {
            EventBus.emit('Web3ConnectionStatus', false);
            // if (IPC_COULD_NOT_CONNECT === error) {
                setTimeout(() => {
                    this.connectToIPC(resolve);
                }, 5000);
            // }
        }
    }

    set gasPrice(price) {
        gasPrice = price;
    }

    get gasPrice() {
        return gasPrice || ETHConfiguration.gasPrice;
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

    get currentBlockNumber() {
        return currentBlockNumber;
    }

}