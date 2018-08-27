import { getTokenContract } from '../contracts/token';
import { getContractOwnerAddress } from '../contracts/owner';
import { BigNumber } from 'bignumber.js';
import {WEB3_ACTION_NOTIFICATION_TRANSFER} from 'constants/messageActions';
import {RESPONSE_STATUS_SUCCESS} from 'constants/messageStatuses';
import { ETHConfiguration } from 'configs/';

const TOP_UP_TOKENS_TRANSACTION = 'TOP_UP_TOKENS_TRANSACTION';
const { sufficientConfirmations } = ETHConfiguration;
let module = null;

export default class TokenController {

    constructor(baseModule) {
        module = baseModule;
    }

    async topUpTokens({request, response}) {

        const { userId, amount} = request;
        const Token = getTokenContract(module.eth.Contract);

        Token.methods.transfer(userId, new BigNumber(amount)).send({ from: getContractOwnerAddress() })
            .once('transactionHash', (transactionHash) => {
                response.data = getCommonTransactionResponse(transactionHash, userId, 0);
                module.transactions = {
                    transactionHash,
                    [Symbol.for('transactionType')]: TOP_UP_TOKENS_TRANSACTION
                };
                module.onExecutedOwnerTransaction();
                module.sendResponseToClient(response);
            }).on('confirmation', function(confNumber, transaction) {
                const {transactionHash} = transaction;

                response.data = getCommonTransactionResponse(transactionHash, userId, confNumber + 1);
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
                transaction[Symbol.for('transactionType')] = TOP_UP_TOKENS_TRANSACTION;
                module.updateTransactionMined = transaction;
            });
    }

}

function getCommonTransactionResponse(transactionHash, userId, confNum) {
    return {
        status: RESPONSE_STATUS_SUCCESS,
        command: WEB3_ACTION_NOTIFICATION_TRANSFER,
        response: {
            event: TOP_UP_TOKENS_TRANSACTION,
            confNum,
            confMax: sufficientConfirmations,
            transactionHash,
            userId
        }
    };
}