import EventBus from 'common/EventBus';
import {
    CLIENT_ACTION_AUTH_USER, CLIENT_ACTION_ADD_USERS,
    CLIENT_ACTION_GET_WEB3_PROXY_VERSION
} from 'constants/messageActions';

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