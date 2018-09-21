import { getTokenContract } from '../contracts/token';
import { getDepositContract } from '../contracts/deposit';
import { getContractOwnerAddress } from '../contracts/owner';
import { getGameAddress, getGameContract } from '../contracts/game';
import { BigNumber } from 'bignumber.js';
import { ETHConfiguration } from 'configs/';
import { getCommonTransactionResponse } from '../responses';
import { notifyTransfersInProgress } from './transfer';

const TOP_UP_TOKENS_TRANSACTION = 'TOP_UP_TOKENS_TRANSACTION';
const TRANSFER_TO_GAME_TRANSACTION = 'TRANSFER_TO_GAME_TRANSACTION';
const TRANSFER_FROM_GAME_TRANSACTION = 'TRANSFER_FROM_GAME_TRANSACTION';
const { sufficientConfirmations } = ETHConfiguration;
let module = null;

export default class TransferExecuteController {

    constructor(baseModule) {
        module = baseModule;
        this.transfer = module.transferController;
    }

    async transferToGame({request}, fromBlock) {
        const { userId } = request;
        const Deposit = getDepositContract(module.eth.Contract);

        const contract = Deposit.methods.transferToGame(userId, getGameAddress()).send({ from: getContractOwnerAddress() });
        this.getContractEvents(contract, TRANSFER_TO_GAME_TRANSACTION, userId, fromBlock);
    }

    async transferFromGame({request}, fromBlock) {
        const { userId, balance, gameProcessHash } = request;
        const Game = getGameContract(module.eth.Contract);

        const contract = Game.methods.responseFromWS(userId, balance, gameProcessHash).send({ from: getContractOwnerAddress() });
        this.getContractEvents(contract, TRANSFER_FROM_GAME_TRANSACTION, userId, fromBlock);
    }

    async topUpTokens({request}, fromBlock) {

        const { userId, amount} = request;
        const Token = getTokenContract(module.eth.Contract);

        const contract = Token.methods.transfer(userId, new BigNumber(amount)).send({ from: getContractOwnerAddress() });
        this.getContractEvents(contract, TOP_UP_TOKENS_TRANSACTION, userId, fromBlock);
    }

    getContractEvents(executedContract, transactionType, userId, fromBlock) {
        executedContract.once('transactionHash', (transactionHash) => {
            const transaction = {
                transactionHash,
                [Symbol.for('transactionType')]: transactionType,
                [Symbol.for('userId')]: userId,
                [Symbol.for('blocksChecked')]: 0,
                blockNumber: fromBlock,
                status: 1
            };
            transaction[Symbol.for('status')] = getCommonTransactionResponse(transaction);
            module.addTransaction(transaction);
            module.onExecutedOwnerTransaction();
            notifyTransfersInProgress(transaction);
        }).on('confirmation', function(confNumber, transaction) {
            transaction[Symbol.for('transactionType')] = transactionType;
            transaction[Symbol.for('userId')] = userId;
            transaction[Symbol.for('blocksChecked')] = confNumber + 1;
            transaction[Symbol.for('status')] = getCommonTransactionResponse(transaction);
            module.updateTransactionMined(transaction);
            notifyTransfersInProgress(transaction);

            if (confNumber >= sufficientConfirmations - 1 || !Number(transaction.status)) {
                module.removeTransaction(transaction);
                this.off('confirmation');
            }
        }).on('error', (error) => {
            if (this.off) {
                this.off('confirmation');
            }
            console.warn('startGameSession on Error', error.toString());
            module.forceCheckFailedTransactions();
        }).then((transaction) => {
            transaction[Symbol.for('transactionType')] = transactionType;
            transaction[Symbol.for('userId')] = userId;
            transaction[Symbol.for('blocksChecked')] = 0;
            transaction[Symbol.for('status')] = getCommonTransactionResponse(transaction);
            module.updateTransactionMined(transaction);
        }).catch((e) => {
            console.error(e);
        });
    }
}
