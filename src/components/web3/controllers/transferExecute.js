import { getTokenContract } from '../contracts/token';
import { getDepositContract } from '../contracts/deposit';
import { getContractOwnerAddress } from '../contracts/owner';
import { getGameAddress, getGameContract } from '../contracts/game';
import { BigNumber } from 'bignumber.js';
import { RESPONSE_STATUS_SUCCESS } from 'constants/messageStatuses';
import { ETHConfiguration } from 'configs/';
import { getCommonTransactionResponse } from '../responses';
import {WEB3_ACTION_NOTIFICATION_TRANSFER} from 'constants/messageActions';

const TOP_UP_TOKENS_TRANSACTION = 'TOP_UP_TOKENS_TRANSACTION';
const TRANSFER_TO_GAME_TRANSACTION = 'TRANSFER_TO_GAME_TRANSACTION';
const TRANSFER_FROM_GAME_TRANSACTION = 'TRANSFER_FROM_GAME_TRANSACTION';
const { sufficientConfirmations } = ETHConfiguration;
let module = null;

export default class TransferExecuteController {

    constructor(baseModule) {
        module = baseModule;
    }

    async transferToGame({request}) {
        const { userId } = request;
        const Deposit = getDepositContract(module.eth.Contract);

        const contract = Deposit.methods.transferToGame(userId, getGameAddress()).send({ from: getContractOwnerAddress() });
        this.getContractEvents(contract, TRANSFER_TO_GAME_TRANSACTION, userId);
    }

    async transferFromGame({request}) {
        const { userId, balance, gameProcessHash } = request;
        const Game = getGameContract(module.eth.Contract);

        const contract = Game.methods.responseFromWS(userId, balance, gameProcessHash).send({ from: getContractOwnerAddress() });
        this.getContractEvents(contract, TRANSFER_FROM_GAME_TRANSACTION, userId);
    }

    async topUpTokens({request}) {

        const { userId, amount} = request;
        const Token = getTokenContract(module.eth.Contract);

        const contract = Token.methods.transfer(userId, new BigNumber(amount)).send({ from: getContractOwnerAddress() });
        this.getContractEvents(contract, TOP_UP_TOKENS_TRANSACTION, userId);
    }

    getContractEvents(executedContract, transactionType, userId) {
        executedContract.once('transactionHash', (transactionHash) => {
            const transaction = {
                transactionHash,
                [Symbol.for('transactionType')]: transactionType,
                [Symbol.for('userId')]: userId,
                [Symbol.for('blocksChecked')]: 0
            };
            transaction[Symbol.for('status')] = getCommonTransactionResponse(transaction);
            module.transactions = transaction;
            module.onExecutedOwnerTransaction();
            this.notifyTransfersInProgress(transaction, RESPONSE_STATUS_SUCCESS);
        }).on('confirmation', function(confNumber, transaction) {
            transaction[Symbol.for('transactionType')] = transactionType;
            transaction[Symbol.for('userId')] = userId;
            transaction[Symbol.for('blocksChecked')] = confNumber + 1;
            transaction[Symbol.for('status')] = getCommonTransactionResponse(transaction);
            module.updateTransactionMined = transaction;
            this.notifyTransfersInProgress(transaction, RESPONSE_STATUS_SUCCESS);

            if (confNumber >= sufficientConfirmations - 1) {
                module.removeTransaction(transaction);
                this.off('confirmation');
            }
        }).on('error', (error) => {
            console.warn('startGameSession on Error', error.toString());
            // if (error.toString() === 'Error: Returned error: authentication needed: password or unlock') {
            //     this.topUpTokens({request, response}, true);
            // }
        }).then((transaction) => {
            transaction[Symbol.for('transactionType')] = transactionType;
            transaction[Symbol.for('userId')] = userId;
            transaction[Symbol.for('blocksChecked')] = 0;
            transaction[Symbol.for('status')] = getCommonTransactionResponse(transaction);
            module.updateTransactionMined = transaction;
        });
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
