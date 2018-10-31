import { ERROR_WEB3_GET_BALANCE, ERROR_WEB3_CURRENCY_DOES_NOT_EXIST, ERROR_WEB3_LOCATION_DOES_NOT_EXIST } from 'constants/errors';
import { ETHConfiguration } from 'configs/';
import { SUBSCRIPTION_TRANSACTION } from '../controllers/transferListener';
import _ from 'lodash';

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

    const response = {
        event: transaction[Symbol.for('transactionType')],
        confNum: transaction[Symbol.for('blocksChecked')],
        confMax: sufficientConfirmations,
        transactionHash: transaction.transactionHash,
        userId: transaction[Symbol.for('userId')]
    };

    if (transaction[Symbol.for('transactionType')] === SUBSCRIPTION_TRANSACTION) {
        response['timepoint'] = _.get(transaction, 'returnValues.timepoint', 0);
        response['amountOfTime'] = _.get(transaction, 'returnValues.amountOfTime', 0);
    }

    return response;
}

export function getUserDoesNotExistResponse(userId) {
    return { userId, exist: false };
}