import EventBus from '../common/EventBus';
import {
    CLIENT_ACTION_GET_CONFIGURATION_DATA,
    CLIENT_ACTION_GET_TRANSFERS_IN_PROGRESS } from 'constants/messageActions';

export default function ethMessagesHandler({method, request, response}) {
    switch (method) {
        case CLIENT_ACTION_GET_CONFIGURATION_DATA:
            EventBus.emit('Web3GetConfigurationData', {request, response});
            break;
        case CLIENT_ACTION_GET_TRANSFERS_IN_PROGRESS:
            EventBus.emit('Web3GetTransfersInProgress', {request, response});
            break;
        default:
            EventBus.emit('incorrectRequestedCommand', {response, command: method});
    }
}