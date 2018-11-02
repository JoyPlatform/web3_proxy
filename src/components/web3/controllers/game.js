import { getGameContract } from '../contracts/game';
import { RESPONSE_STATUS_SUCCESS } from 'constants/messageStatuses';

let module = null;

export default class GameController {

    constructor(baseModule) {
        module = baseModule;
    }

    async getOpenSessions({request, response}) {
        const { userId } = request;
        const contract = new getGameContract(module.eth.Contract, module.gasPrice);
        const openSessions = await contract.methods.openSessions(userId).call();

        response.data.status = RESPONSE_STATUS_SUCCESS;
        response.data.response = {isGameSessionOpen: openSessions};

        module.sendResponseToClient(response);
    }
}