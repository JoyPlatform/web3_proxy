import { getTokenContract } from '../contracts/token';
import { getDepositContract } from '../contracts/deposit';
import { getContractOwnerAddress } from '../contracts/owner';
import { getGameAddress, getGameContract } from '../contracts/game';
import { BigNumber } from 'bignumber.js';
import {WEB3_ACTION_NOTIFICATION_TRANSFER} from 'constants/messageActions';
import {RESPONSE_STATUS_SUCCESS} from 'constants/messageStatuses';
import { ETHConfiguration } from 'configs/';

const TOP_UP_TOKENS_TRANSACTION = 'TOP_UP_TOKENS_TRANSACTION';
const TRANSFER_TO_GAME_TRANSACTION = 'TRANSFER_TO_GAME_TRANSACTION';
const TRANSFER_FROM_GAME_TRANSACTION = 'TRANSFER_FROM_GAME_TRANSACTION';
const { sufficientConfirmations } = ETHConfiguration;
let module = null;

export default class TransferExecuteController {

    constructor(baseModule) {
        module = baseModule;
    }

    async transferToGame({request, response}) {
        const { userId } = request;
        const Deposit = getDepositContract(module.eth.Contract);

        const contract = Deposit.methods.transferToGame(userId, getGameAddress()).send({ from: getContractOwnerAddress() });
        this.getContractEvents(contract, TRANSFER_TO_GAME_TRANSACTION, response, userId);
    }

    async transferFromGame({request, response}) {
        const { userId, balance, gameProcessHash } = request;
        const Game = getGameContract(module.eth.Contract);

        const contract = Game.methods.responseFromWS(userId, balance, gameProcessHash).send({ from: getContractOwnerAddress() });
        this.getContractEvents(contract, TRANSFER_FROM_GAME_TRANSACTION, response, userId);
    }

    async topUpTokens({request, response}) {

        const { userId, amount} = request;
        const Token = getTokenContract(module.eth.Contract);

        const contract = Token.methods.transfer(userId, new BigNumber(amount)).send({ from: getContractOwnerAddress() });
        this.getContractEvents(contract, TOP_UP_TOKENS_TRANSACTION, response, userId);
    }

    getContractEvents(executedContract, transactionType, response, userId) {
        executedContract.once('transactionHash', (transactionHash) => {
            response.data = getCommonTransactionResponse(transactionType, transactionHash, userId, 0);
            module.transactions = {
                transactionHash,
                [Symbol.for('transactionType')]: transactionType
            };
            module.onExecutedOwnerTransaction();
            module.sendResponseToClient(response);
        }).on('confirmation', function(confNumber, transaction) {
            const {transactionHash} = transaction;

            response.data = getCommonTransactionResponse(transactionType, transactionHash, userId, confNumber + 1);
            module.sendResponseToClient(response);

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
            module.updateTransactionMined = transaction;
        });
    }

}

function getCommonTransactionResponse(transactionType, transactionHash, userId, confNum) {
    return {
        status: RESPONSE_STATUS_SUCCESS,
        command: WEB3_ACTION_NOTIFICATION_TRANSFER,
        response: {
            event: transactionType,
            confNum,
            confMax: sufficientConfirmations,
            transactionHash,
            userId
        }
    };
}