import EventBus from '../common/EventBus';
import {
    CLIENT_ACTION_CONNECTION_TO_ETH,
    CLIENT_ACTION_GET_BALANCES,
    CLIENT_ACTION_GET_CONFIGURATION_DATA,
    CLIENT_ACTION_GET_TRANSFERS_IN_PROGRESS,
    CLIENT_ACTION_TOP_UP_TOKENS,
    CLIENT_ACTION_TRANSFER_FROM_GAME,
    CLIENT_ACTION_TRANSFER_TO_GAME,
    CLIENT_ACTION_GET_TRANSACTION_STATUS,
    CLIENT_ACTION_GET_PAST_SUBSCRIPTION_EVENTS,
    CLIENT_ACTION_GET_GAME_OPEN_SESSIONS
} from 'constants/messageActions';

export default function ethMessagesHandler({method, request, response}) {
    switch (method) {
        case CLIENT_ACTION_GET_CONFIGURATION_DATA:
            EventBus.emit('Web3GetConfigurationData', {request, response});
            break;
        case CLIENT_ACTION_GET_TRANSFERS_IN_PROGRESS:
            EventBus.emit('Web3GetTransfersInProgress', {request, response});
            break;
        case CLIENT_ACTION_GET_BALANCES:
            EventBus.emit('Web3Balances', {request, response});
            break;
        case CLIENT_ACTION_TOP_UP_TOKENS:
            EventBus.emit('Web3TopUpTokens', {request, response});
            break;
        case CLIENT_ACTION_TRANSFER_TO_GAME:
            EventBus.emit('Web3TransferToGame', {request, response});
            break;
        case CLIENT_ACTION_TRANSFER_FROM_GAME:
            EventBus.emit('Web3TransferFromGame', {request, response});
            break;
        case CLIENT_ACTION_CONNECTION_TO_ETH:
            EventBus.emit('Web3ConnectionStatusForNewClient', {request, response});
            break;
        case CLIENT_ACTION_GET_TRANSACTION_STATUS:
            EventBus.emit('Web3TransactionStatus', {request, response});
            break;
        case CLIENT_ACTION_GET_PAST_SUBSCRIPTION_EVENTS:
            EventBus.emit('Web3GetPastSubscriptionEvents', {request, response});
            break;
        case CLIENT_ACTION_GET_GAME_OPEN_SESSIONS:
            EventBus.emit('Web3GetGameOpenSessions', {request, response});
            break;
        default:
            EventBus.emit('incorrectRequestedCommand', {response, command: method});
    }
}