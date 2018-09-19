import { ERROR_WEB3_GET_BALANCE, ERROR_WEB3_CURRENCY_DOES_NOT_EXIST, ERROR_WEB3_LOCATION_DOES_NOT_EXIST } from 'constants/errors';
import { ETHConfiguration } from 'configs/';

const { sufficientConfirmations } = ETHConfiguration;

export function getETHBalanceConnectionProblemsResponse({currency, location, error}) {
    console.error(ERROR_WEB3_GET_BALANCE);
    console.log(error);
    return {currency, balance: null, location, error: ERROR_WEB3_GET_BALANCE};
}

export function getETHBalanceCurrencyDoesNotExistResponse({currency, location}) {
    console.warn(ERROR_WEB3_CURRENCY_DOES_NOT_EXIST, currency);
    return {currency, balance: null, location, error: ERROR_WEB3_CURRENCY_DOES_NOT_EXIST};
}

export function getETHBalanceLocationDoesNotExistResponse({currency, location}) {
    console.warn(ERROR_WEB3_LOCATION_DOES_NOT_EXIST, location);
    return {currency, balance: null, location, error: ERROR_WEB3_LOCATION_DOES_NOT_EXIST};
}

export function getCommonTransactionResponse(transaction) {
    return {
        // userId: transaction[Symbol.for('userId')],
        // data: {
        //     status,
        //     command: WEB3_ACTION_NOTIFICATION_TRANSFER,
        //     response: {
                event: transaction[Symbol.for('transactionType')],
                confNum: transaction[Symbol.for('blocksChecked')],
                confMax: sufficientConfirmations,
                transactionHash: transaction.transactionHash,
                userId: transaction[Symbol.for('userId')]
            // }
        // }
    };
}