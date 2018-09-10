import EventBus from 'common/EventBus';
import {
    CLIENT_ACTION_AUTH_USER, CLIENT_ACTION_ADD_USERS, CLIENT_ACTION_GET_BALANCES,
    CLIENT_ACTION_GET_CONFIGURATION_DATA, CLIENT_ACTION_TOP_UP_TOKENS,
    CLIENT_ACTION_TRANSFER_TO_GAME, CLIENT_ACTION_TRANSFER_FROM_GAME,
    CLIENT_ACTION_GET_WEB3_PROXY_VERSION
} from 'constants/messageActions';
import { MODULE_CLIENT, MODULE_WEB3} from 'constants/modules';

export default function clientMessagesHandler({method, request, response}) {
    switch (method) {
        case CLIENT_ACTION_ADD_USERS:
            EventBus.emit('addUsersToClient', {request, response});
            break;
        case CLIENT_ACTION_AUTH_USER:
            EventBus.emit('Web3Authentication', {request, response, callbackEmit: 'addUserToClient'});
            break;
        case CLIENT_ACTION_GET_WEB3_PROXY_VERSION:
            EventBus.emit('getServerVersion', {request, response});
            break;
        default:
            EventBus.emit('incorrectRequestedCommand', {response, command: method});
    }
}

export function parseRequestCommand(command) {

    const result = {method: command, module: ''};


    switch (command) {
        case CLIENT_ACTION_GET_BALANCES:
        case CLIENT_ACTION_GET_CONFIGURATION_DATA:
        case CLIENT_ACTION_TOP_UP_TOKENS:
        case CLIENT_ACTION_TRANSFER_TO_GAME:
        case CLIENT_ACTION_TRANSFER_FROM_GAME:
            result.module = MODULE_WEB3;
            break;
        case CLIENT_ACTION_ADD_USERS:
        case CLIENT_ACTION_AUTH_USER:
        case CLIENT_ACTION_GET_WEB3_PROXY_VERSION:
            result.module = MODULE_CLIENT;
            break;
        default:
            result.module = '';
    }

    return result;
}