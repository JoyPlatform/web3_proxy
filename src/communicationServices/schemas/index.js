import Ajv from 'ajv';
import _ from 'lodash';
import {
    CLIENT_ACTION_AUTH_USER, CLIENT_ACTION_ADD_USERS, CLIENT_ACTION_GET_BALANCES,
    CLIENT_ACTION_GET_CONFIGURATION_DATA, CLIENT_ACTION_TOP_UP_TOKENS,
    CLIENT_ACTION_TRANSFER_TO_GAME, CLIENT_ACTION_TRANSFER_FROM_GAME,
    CLIENT_ACTION_GET_WEB3_PROXY_VERSION, CLIENT_ACTION_GET_TRANSFERS_IN_PROGRESS,
    CLIENT_ACTION_GET_TRANSACTION_STATUS, CLIENT_ACTION_GET_PAST_SUBSCRIPTION_EVENTS,
    CLIENT_ACTION_GET_GAME_OPEN_SESSIONS
} from 'constants/messageActions';
import {
    getAuthSchema,
    getBalancesSchema,
    getUsersSchema,
    getEmptyDataSchema,
    getTopUpTokensSchema,
    getTransferFromGameSchema,
    getTransactionStatusSchema
} from './schemas';

const ajv = new Ajv({allErrors: true});
const getEmptyDataSchemaValidator = ajv.compile(getEmptyDataSchema);
const getUsersSchemaValidator = ajv.compile(getUsersSchema);
const getAuthSchemaValidator = ajv.compile(getAuthSchema);
const getBalancesSchemaValidator = ajv.compile(getBalancesSchema);
const getTopUpTokensSchemaValidator = ajv.compile(getTopUpTokensSchema);
const getTransferFromGameSchemaValidator = ajv.compile(getTransferFromGameSchema);
const getTransactionStatusSchemaValidator = ajv.compile(getTransactionStatusSchema);

export default function checkSchema(data) {
    const method = _.get(data, 'command', '');

    switch (method) {
        case CLIENT_ACTION_GET_CONFIGURATION_DATA:
        case CLIENT_ACTION_GET_WEB3_PROXY_VERSION:
            return getEmptyDataSchemaValidator(data);
        case CLIENT_ACTION_ADD_USERS:
        case CLIENT_ACTION_GET_TRANSFERS_IN_PROGRESS:
            return getUsersSchemaValidator(data);
        case CLIENT_ACTION_AUTH_USER:
        case CLIENT_ACTION_TRANSFER_TO_GAME:
        case CLIENT_ACTION_GET_PAST_SUBSCRIPTION_EVENTS:
        case CLIENT_ACTION_GET_GAME_OPEN_SESSIONS:
            return getAuthSchemaValidator(data);
        case CLIENT_ACTION_GET_BALANCES:
            return getBalancesSchemaValidator(data);
        case CLIENT_ACTION_TOP_UP_TOKENS:
            return getTopUpTokensSchemaValidator(data);
        case CLIENT_ACTION_TRANSFER_FROM_GAME:
            return getTransferFromGameSchemaValidator(data);
        case CLIENT_ACTION_GET_TRANSACTION_STATUS:
            return getTransactionStatusSchemaValidator(data);
        default:
            return false;
    }
}