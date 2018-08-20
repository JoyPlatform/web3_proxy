import Ajv from 'ajv';
import _ from 'lodash';

import {
    getAuthSchema,
    getBalancesSchema,
    // getSubscriptionExpiredTime,
    getAddUsersSchema,
    getEmptyDataSchema,
    getTopUpTokensSchema
} from './schemas';

const ajv = new Ajv({allErrors: true});

export default function checkSchema(data) {
    const method = _.get(data, 'command', '');

    let validator = null;
    switch (method) {
        case 'getEntireContractsData':
            validator = ajv.compile(getEmptyDataSchema);
            return validator(data);
        case 'addUsers':
            validator = ajv.compile(getAddUsersSchema);
            return validator(data);
        case 'isUserExist':
            validator = ajv.compile(getAuthSchema);
            return validator(data);
        case 'getBalances':
            validator = ajv.compile(getBalancesSchema);
            return validator(data);
        case 'topUpTokens':
            validator = ajv.compile(getTopUpTokensSchema);
            return validator(data);
        // case 'getSubscriptionAddress':
        // case 'getTokenAddress':
        // case 'getDepositAddress':
        // case 'getTransfersInProgress':
        //     validator = ajv.compile(getEmptyDataSchema);
        //     return validator(data);
        // case 'getSubscriptionExpiredTime':
        //     validator = ajv.compile(getSubscriptionExpiredTime);
        //     return validator(data);
        default:
            return false;
    }
}