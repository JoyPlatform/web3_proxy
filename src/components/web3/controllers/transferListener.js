import { getTokenContract } from '../contracts/token';
import { getSubscriptionContract } from '../contracts/subscription';
import { getDepositAddress } from '../contracts/deposit';
import { getCommonTransactionResponse } from '../responses';
import { notifyTransfersInProgress } from './transfer';
import _ from 'lodash';

let module = null;

const DEPOSIT_TRANSACTION = 'DEPOSIT_TRANSACTION';
const WITHDRAWAL_TRANSACTION = 'WITHDRAWAL_TRANSACTION';
const SUBSCRIPTION_TRANSACTION = 'SUBSCRIPTION_TRANSACTION';

// getting notification about transactions from MetaMask
export default class TransferListenerController {

    constructor(baseModule) {
        module = baseModule;
        // this.registerTransfers();
    }

    registerTransfers() {
        module.eth.getBlockNumber().then((fromBlock) => {
            this.getTransferEvent(DEPOSIT_TRANSACTION, fromBlock);
            this.getTransferEvent(WITHDRAWAL_TRANSACTION, fromBlock);
            this.getTransferEvent(SUBSCRIPTION_TRANSACTION, fromBlock);
        }).catch((e) => {
            console.error('registerTransfers getBlockNumber', e);
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

        transferPending.on('data', (transaction, error) => {
            console.info(`On Transfer PENDING ${type}`);
            if (!error) {
                let userIdKey = getUserIdKey(type);

                transaction[Symbol.for('blocksChecked')] = 0;
                transaction[Symbol.for('transactionType')] = type;
                transaction[Symbol.for('userId')] = _.get(transaction, `returnValues.${userIdKey}`);
                transaction[Symbol.for('status')] = getCommonTransactionResponse(transaction);
                transaction[Symbol.for('checking')] = false;
                transaction.status = 1;
                if (!module.isTransactionExist(transaction)) {
                    notifyTransfersInProgress(transaction);
                    module.addTransaction(transaction);
                }
            }
        }).on('error', console.error);
    }

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