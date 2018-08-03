import {
    getSubscriptionJoyTokenAddress,
    getSubscriptionEtherAddress,
    getSubscriptionJoyTokenABI,
    getSubscriptionEtherABI
} from '../contracts/subscription';
import { getDepositAddress, getDepositABI } from '../contracts/deposit';
import { getTokenAddress, getJoyTokenABI } from '../contracts/token';
import { getGameAddress, getGameABI } from '../contracts/game';

import { RESPONSE_STATUS_SUCCESS } from 'constants/messageStatuses';

let module = null;

export default class ConfigurationController {

    constructor(baseModule) {
        module = baseModule;
    }

    getBaseConfiguration({response}) {
        response.data.status = RESPONSE_STATUS_SUCCESS;
        response.data.response = {
            joyTokenAddress: getTokenAddress(),
            depositAddress: getDepositAddress(),
            demoGameAddress: getGameAddress(),
            subscriptionEtherAddress: getSubscriptionEtherAddress(),
            subscriptionJoyTokenAddress: getSubscriptionJoyTokenAddress(),
            // ABIs
            joyTokenABI: getJoyTokenABI(),
            depositABI: getDepositABI(),
            demoGameABI: getGameABI(),
            subscriptionEtherABI: getSubscriptionEtherABI(),
            subscriptionJoyTokenABI: getSubscriptionJoyTokenABI()
        };

        module.sendResponseToClient(response);
    }

}