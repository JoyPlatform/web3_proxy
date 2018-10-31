import { RESPONSE_STATUS_SUCCESS } from 'constants/messageStatuses';
import { getSubscriptionContract } from '../contracts/subscription';

let module = null;

export default class SubscriptionController {

    constructor(baseModule) {
        module = baseModule;
    }

    async getPlayerPastSubscriptionEvents({request, response}) {
        const { userId } = request;
        const contract = getSubscriptionContract(module.eth.Contract, module.gasPrice);
        const data = [];

        const subscriptions = await contract.getPastEvents('newSubscription', {
            filter: { buyer: userId },
            fromBlock: 0
        });

        subscriptions.forEach((subscription) => {
            const { timepoint, amountOfTime } = subscription.returnValues;
            data.push({ timepoint, amountOfTime });
        });
        response.data.response = {data, userId};
        response.data.status = RESPONSE_STATUS_SUCCESS;

        module.sendResponseToClient(response);
    }

}