import EventBus from 'common/EventBus';
import {
    CLIENT_ACTION_AUTH_USER, CLIENT_ACTION_ADD_USERS, CLIENT_ACTION_GET_BALANCES,
    CLIENT_ACTION_GET_CONFIGURATION_DATA, CLIENT_ACTION_TOP_UP_TOKENS
} from 'constants/messageActions';

export default function clientMessagesHandler({method, request, response}) {
    switch (method) {
        case CLIENT_ACTION_ADD_USERS:
            EventBus.emit('addUsersToClient', {request, response});
            break;
        case CLIENT_ACTION_AUTH_USER:
            EventBus.emit('Web3Authentication', {request, response, callbackEmit: 'addUserToClient'});
            break;
        default:
            EventBus.emit('incorrectRequestedCommand', {response, command: method});
    }
}

export function parseRequestCommand(command) {

    const result = {method: command, module: ''};


    switch (command) {
        // case 'authUser':
        // case 'getBalances':
        //     result.module = 'client';
        //     break;
        // case 'getSubscriptionAddress':
        // case 'getTokenAddress':
        // case 'getDepositAddress':
        // case 'getTransfersInProgress':
        //     result.module = 'web3';
        //     break;
        // case 'getSubscriptionExpiredTime':
        //     result.module = 'wallet';:
        //     break;
        case CLIENT_ACTION_GET_BALANCES:
        case CLIENT_ACTION_GET_CONFIGURATION_DATA:
        case CLIENT_ACTION_TOP_UP_TOKENS:
            result.module = 'web3';
            break;
        case CLIENT_ACTION_ADD_USERS:
        case CLIENT_ACTION_AUTH_USER:
            result.module = 'client';
            break;
        default:
            result.module = '';
    }

    return result;
}