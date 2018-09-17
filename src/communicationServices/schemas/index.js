import Ajv from 'ajv';
import _ from 'lodash';
import {
    CLIENT_ACTION_AUTH_USER, CLIENT_ACTION_ADD_USERS, CLIENT_ACTION_GET_BALANCES,
    CLIENT_ACTION_GET_CONFIGURATION_DATA, CLIENT_ACTION_TOP_UP_TOKENS,
    CLIENT_ACTION_TRANSFER_TO_GAME, CLIENT_ACTION_TRANSFER_FROM_GAME,
    CLIENT_ACTION_GET_WEB3_PROXY_VERSION
} from 'constants/messageActions';
import {
    getAuthSchema,
    getBalancesSchema,
    // getSubscriptionExpiredTime,
    getAddUsersSchema,
    getEmptyDataSchema,
    getTopUpTokensSchema,
    getTransferFromGameSchema
} from './schemas';

const ajv = new Ajv({allErrors: true});
const getEmptyDataSchemaValidator = ajv.compile(getEmptyDataSchema);
const getAddUsersSchemaValidator = ajv.compile(getAddUsersSchema);
const getAuthSchemaValidator = ajv.compile(getAuthSchema);
const getBalancesSchemaValidator = ajv.compile(getBalancesSchema);
const getTopUpTokensSchemaValidator = ajv.compile(getTopUpTokensSchema);
const getTransferFromGameSchemaValidator = ajv.compile(getTransferFromGameSchema);

export default function checkSchema(data) {
    const method = _.get(data, 'command', '');

    switch (method) {
        case CLIENT_ACTION_GET_CONFIGURATION_DATA:
        case CLIENT_ACTION_GET_WEB3_PROXY_VERSION:
            return getEmptyDataSchemaValidator(data);
        case CLIENT_ACTION_ADD_USERS:
            return getAddUsersSchemaValidator(data);
        case CLIENT_ACTION_AUTH_USER:
        case CLIENT_ACTION_TRANSFER_TO_GAME:
            return getAuthSchemaValidator(data);
        case CLIENT_ACTION_GET_BALANCES:
            return getBalancesSchemaValidator(data);
        case CLIENT_ACTION_TOP_UP_TOKENS:
            return getTopUpTokensSchemaValidator(data);
        case CLIENT_ACTION_TRANSFER_FROM_GAME:
            return getTransferFromGameSchemaValidator(data);
        default:
            return false;
    }
}