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
            'required': [ 'balances', 'userId' ],
            'properties': {
                'balances': {
                    'type': 'array',
                    "minItems": 1,
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
                },
                'userId': {
                    'type': 'string'
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

export const getAddUsersSchema = {
    '$id': 'getAddUsersSchema',
    'type': 'object',
    'required': [ 'command', 'data' ],
    'properties': {
        'command': {
            'type': 'string'
        },
        'data': {
            'required': [ 'userIds' ],
            'type': 'object',
            'properties': {
                'userIds': {
                    'type': 'array',
                    "minItems": 1,
                    'items': {
                        'allOf': [
                            {
                                'type': 'string'
                            }
                        ]
                    }
                }
            }
        }
    }
};

export const getTopUpTokensSchema = {
    '$id': 'getTopUpTokensSchema',
    'type': 'object',
    'required': [ 'command', 'data' ],
    'properties': {
        'command': {
            'type': 'string'
        },
        'data': {
            'required': [ 'userId', 'amount' ],
            'type': 'object',
            'properties': {
                'userId': {
                    'type': 'string'
                },
                'amount': {
                    'type': 'string'
                }
            }
        }
    }
};

export const getTransferFromGameSchema = {
    '$id': 'getEndGameSessionSchema',
    'type': 'object',
    'required': [ 'command', 'data' ],
    'properties': {
        'command': {
            'type': 'string'
        },
        'data': {
            'required': [ 'userId', 'balance', 'gameProcessHash' ],
            'type': 'object',
            'properties': {
                'userId': {
                    'type': 'string'
                },
                'balance': {
                    'type': 'string'
                },
                'gameProcessHash': {
                    'type': 'string'
                }
            }
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