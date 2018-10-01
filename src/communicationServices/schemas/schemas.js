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
            'type': 'string',
            'minLength': 1
        },
        'data': {
            'required': [ 'userId' ],
            'type': 'object',
            'properties': {
                'userId': {
                    'type': 'string',
                    'minLength': 1
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
            'type': 'string',
            'minLength': 1
        },
        'data': {
            'type': 'object',
            'required': [ 'balances', 'userId' ],
            'properties': {
                'balances': {
                    'type': 'array',
                    'minItems': 1,
                    'items': {
                        'allOf': [
                            {
                                'type': 'object',
                                'properties': {
                                    'currency': {
                                        'type': 'string',
                                        'minLength': 1
                                    },
                                    'locations': {
                                        'type': 'array',
                                        'items': {
                                            'allOf': [
                                                {
                                                    'type': 'string',
                                                    'minLength': 1
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
                    'type': 'string',
                    'minLength': 1
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
            'type': 'string',
            'minLength': 1
        }
    }
};

export const getUsersSchema = {
    '$id': 'getUsersSchema',
    'type': 'object',
    'required': [ 'command', 'data' ],
    'properties': {
        'command': {
            'type': 'string',
            'minLength': 1
        },
        'data': {
            'required': [ 'userIds' ],
            'type': 'object',
            'properties': {
                'userIds': {
                    'type': 'array',
                    'minItems': 1,
                    'items': {
                        'allOf': [
                            {
                                'type': 'string',
                                'minLength': 1
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
            'type': 'string',
            'minLength': 1
        },
        'data': {
            'required': [ 'userId', 'amount' ],
            'type': 'object',
            'properties': {
                'userId': {
                    'type': 'string',
                    'minLength': 1
                },
                'amount': {
                    'type': 'string',
                    'minLength': 1
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
            'type': 'string',
            'minLength': 1
        },
        'data': {
            'required': [ 'userId', 'balance', 'gameProcessHash' ],
            'type': 'object',
            'properties': {
                'userId': {
                    'type': 'string',
                    'minLength': 1
                },
                'balance': {
                    'type': 'string',
                    'minLength': 1
                },
                'gameProcessHash': {
                    'type': 'string',
                    'minLength': 1
                }
            }
        }
    }
};

export const getTransactionStatusSchema = {
    '$id': 'getTransactionStatusSchema',
    'type': 'object',
    'required': [ 'command', 'data' ],
    'properties': {
        'command': {
            'type': 'string',
            'minLength': 1
        },
        'data': {
            'type': 'object',
            'oneOf': [{
                'properties': {
                    'transactionHash': {
                        'type': 'string',
                        'minLength': 1
                    }
                },
                'required': ['transactionHash']
            },{
                'properties': {
                    'transactionsHash': {
                        'type': 'array',
                        'minItems': 1,
                        'items': {
                            'allOf': [
                                {
                                    'type': 'string',
                                    'minLength': 1
                                }
                            ]
                        }
                    }
                },
                'required': ['transactionsHash']
            }]
        }
    }
};