// const baseSchema = {
//     '$id': 'base',
//     'type': 'object',
//     'required': [ 'command', 'data' ],
//     'properties': {
//         'command': {
//             'type': 'string'
//         },
//         'data': {
//             '$ref': 'additional#/definitions/data'
//         }
//     }
// };

export const getAuthSchema = {
    '$id': 'getAuthSchema',
    'type': 'object',
    'required': [ 'command', 'data' ],
    'properties': {
        'command': {
            'type': 'string'
        },
        'data': {
            'required': [ 'userId' ],
            'type': 'object',
            'properties': {
                'userId': {
                    'type': 'string'
                }
            }
        }
    }
};

export const getBalancesSchema = {
    '$id': 'getBalancesSchema',
    'type': 'object',
    'required': [ 'command', 'data' ],
    'properties': {
        'command': {
            'type': 'string'
        },
        'data': {
            'type': 'object',
            'required': [ 'balances' ],
            'properties': {
                'balances': {
                    'type': 'array',
                    'items': {
                        'allOf': [
                            {
                                'type': 'object',
                                'properties': {
                                    'currency': {
                                        'type': 'string'
                                    },
                                    'locations': {
                                        'type': 'array',
                                        'items': {
                                            'allOf': [
                                                {
                                                    'type': 'string'
                                                }
                                            ]
                                        }
                                    }
                                },
                                'required': [ 'currency', 'locations' ]
                            }

                        ]
                    }
                }
            }
        }
    }
};

export const getEmptyDataSchema = {
    '$id': 'getEmptyDataSchema',
    'type': 'object',
    'required': [ 'command'],
    'properties': {
        'command': {
            'type': 'string'
        }
    }
};

export const getSubscriptionExpiredTime = {

    '$id': 'getSubscriptionExpiredTime',
    'type': 'object',
    'required': [ 'command', 'data' ],
    'properties': {
        'command': {
            'type': 'string'
        },
        'data': {
            'type': 'object',
            'required': [ 'unit' ],
            'properties': {
                'unit': {
                    'type': 'string'
                }
            }
        }
    }
};