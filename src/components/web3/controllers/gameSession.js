import { getDepositContract } from '../contracts/deposit';
import { getGameAddress } from '../contracts/game';
import { getContractOwnerAddress } from '../contracts/owner';

let module = null;

export class GameSessionController {
    constructor(baseModule) {
        module = baseModule;
    }

    startGameSession({request, response}) {
        const deposit = getDepositContract();
        const { userId } = request;

        deposit.methods.transferToGame(userId, getGameAddress()).send({ from: getContractOwnerAddress() })
            .once('transactionHash', (txHash) => {

            }).on('confirmation', function() {

            }).on('error', (error) => {
                console.error('startGameSession on Error', error);
            })
            .then((receipt) => {

            });

    }

    endGameSession() {

    }
}