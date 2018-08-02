import EventBus from 'common/EventBus';
import { CLIENT_ACTION_AUTH_USER, CLIENT_ACTION_GET_BALANCES } from 'constants/messageActions';

export default function clientMessagesHandler({method, request, response}) {
    switch (method) {
        case CLIENT_ACTION_AUTH_USER:
            EventBus.emit('Web3Authentication', {request, response, callbackEmit: 'authUserVerification'});
            break;
        case CLIENT_ACTION_GET_BALANCES:
            EventBus.emit('Web3Balances', {request, response});
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
        //     result.module = 'wallet';
        //     break;
        case 'getEntireContractsData':
            result.module = 'web3';
            break;
        default:
            result.module = '';
    }

    return result;
}