import {
    CLIENT_ACTION_AUTH_USER, CLIENT_ACTION_ADD_USERS, CLIENT_ACTION_GET_BALANCES,
    CLIENT_ACTION_GET_CONFIGURATION_DATA, CLIENT_ACTION_TOP_UP_TOKENS,
    CLIENT_ACTION_TRANSFER_TO_GAME, CLIENT_ACTION_TRANSFER_FROM_GAME,
    CLIENT_ACTION_GET_WEB3_PROXY_VERSION, CLIENT_ACTION_GET_TRANSFERS_IN_PROGRESS
} from 'constants/messageActions';
import { MODULE_CLIENT, MODULE_WEB3} from 'constants/modules';

export default function parseRequestCommand(command) {

    const result = {method: command, module: ''};

    switch (command) {
        case CLIENT_ACTION_GET_BALANCES:
        case CLIENT_ACTION_GET_CONFIGURATION_DATA:
        case CLIENT_ACTION_TOP_UP_TOKENS:
        case CLIENT_ACTION_TRANSFER_TO_GAME:
        case CLIENT_ACTION_TRANSFER_FROM_GAME:
        case CLIENT_ACTION_GET_TRANSFERS_IN_PROGRESS:
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