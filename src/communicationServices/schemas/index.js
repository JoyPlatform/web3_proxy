import Ajv from 'ajv';
import _ from 'lodash';

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
        case 'getEntireContractsData':
        case 'getWeb3ProxyVersion':
            return getEmptyDataSchemaValidator(data);
        case 'addUsers':
            return getAddUsersSchemaValidator(data);
        case 'isUserExist':
        case 'transferToGame':
            return getAuthSchemaValidator(data);
        case 'getBalances':
            return getBalancesSchemaValidator(data);
        case 'topUpTokens':
            return getTopUpTokensSchemaValidator(data);
        case 'transferFromGame':
            return getTransferFromGameSchemaValidator(data);
        default:
            return false;
    }
}