import { getTokenContract } from '../contracts/token';
import { getDepositContract } from '../contracts/deposit';
import { getContractOwnerAddress } from '../contracts/owner';
import { getGameAddress, getGameContract } from '../contracts/game';
import BN from 'bn.js';
import { getCommonTransactionResponse } from '../responses';
import { notifyTransfersInProgress } from './transfer';

const TOP_UP_TOKENS_TRANSACTION = 'TOP_UP_TOKENS_TRANSACTION';
const TRANSFER_TO_GAME_TRANSACTION = 'TRANSFER_TO_GAME_TRANSACTION';
const TRANSFER_FROM_GAME_TRANSACTION = 'TRANSFER_FROM_GAME_TRANSACTION';
let module = null;

export default class TransferExecuteController {

    constructor(baseModule) {
        module = baseModule;
    }

    async transferToGame({request, response}, fromBlock) {
        const { userId } = request;
        const Deposit = getDepositContract(module.eth.Contract, module.gasPrice);

        const contract = Deposit.methods.transferToGame(userId, getGameAddress()).send({ from: getContractOwnerAddress() });
        this.getContractEvents(contract, TRANSFER_TO_GAME_TRANSACTION, userId, fromBlock, response.data.opId);
    }

    async transferFromGame({request, response}, fromBlock) {
        const { userId, balance, gameProcessHash } = request;
        const Game = getGameContract(module.eth.Contract);

        const contract = Game.methods.responseFromWS(userId, balance, gameProcessHash).send({ from: getContractOwnerAddress() });
        this.getContractEvents(contract, TRANSFER_FROM_GAME_TRANSACTION, userId, fromBlock, response.data.opId);
    }

    async topUpTokens({request, response}, fromBlock) {

        const { userId, amount} = request;
        const Token = getTokenContract(module.eth.Contract, module.gasPrice);
        const contract = Token.methods.transfer(userId, new BN(amount)).send({ from: getContractOwnerAddress() });

        this.getContractEvents(contract, TOP_UP_TOKENS_TRANSACTION, userId, fromBlock, response.data.opId);
    }

    getContractEvents(executedContract, transactionType, userId, fromBlock, opId) {
        executedContract.once('transactionHash', (transactionHash) => {
            const transaction = {
                transactionHash,
                [Symbol.for('transactionType')]: transactionType,
                [Symbol.for('userId')]: userId,
                [Symbol.for('blocksChecked')]: 0,
                [Symbol.for('checking')]: false,
                [Symbol.for('opId')]: opId,
                blockNumber: fromBlock,
                status: 1
            };
            transaction[Symbol.for('status')] = getCommonTransactionResponse(transaction);
            module.addTransaction(transaction);
            module.onExecutedOwnerTransaction();
            notifyTransfersInProgress(transaction);
        });
    }
}
