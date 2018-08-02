import { getTokenContract } from '../contracts/token';
import { getDepositContract } from '../contracts/deposit';
import { getETHBalanceConnectionProblemsResponse, getETHBalanceLocationDoesNotExistResponse, getETHBalanceCurrencyDoesNotExistResponse } from '../responses/';
import { RESPONSE_STATUS_SUCCESS, RESPONSE_STATUS_ERROR } from 'constants/messageStatuses';
import _ from 'lodash';

let module = null;

export default class BalanceComponent {

    constructor(baseModule) {
        module = baseModule;
    }

    async getBalances({request, response}) {
        const balances = await this.getAllBalances(request);

        if (_.find(balances, (balance) => {return balance.error;})) {
            response.data.status = RESPONSE_STATUS_ERROR;
        } else {
            response.data.status = RESPONSE_STATUS_SUCCESS;
        }

        response.data.response = balances;

        module.sendResponseToClient(response);
    }

    getAllBalances({balances, clientId}) {

        const promises = [];
        balances.forEach(({currency, locations}) => {
            locations.forEach((location) => {
                const promise = this.getCurrencyBalance({location, currency, clientId});

                promise && promises.push(promise);
            });
        });

        return Promise.all(promises);
    }

    getCurrencyBalance({location, currency, clientId}) {
        switch (location) {
            case 'world':
                return this.getWorldBalance({currency, address: clientId, location});
            case 'platform':
                return this.getPlatformBalance({currency, address: clientId, location});
            case 'gameSession':
                return this.getGameSessionBalance({currency, address: clientId, location});
            default:
                return new Promise((resolve) => {
                    resolve(getETHBalanceLocationDoesNotExistResponse({currency, location}));
                });
        }
    }

    getWorldBalance({currency, address, location}) {
        switch (currency) {
            case 'Eth':
                return this.getEthWorld(address, currency, location);
            case 'Wei':
                return this.getWeiWorld(address, currency, location);
            case 'JoyToken':
                return this.getJoyTokenWorld(address, currency, location);
            default:
                return new Promise((resolve) => {
                    resolve(getETHBalanceCurrencyDoesNotExistResponse({currency, location}));
                });
        }
    }

    getPlatformBalance({currency, address, location}) {
        switch (currency) {
            case 'JoyToken':
                return this.getPlatformDeposit(address, currency, location);
            default:
                return new Promise((resolve) => {
                    resolve(getETHBalanceCurrencyDoesNotExistResponse({currency, location}));
                });
        }
    }

    getGameSessionBalance({currency, address, location}) {
        switch (currency) {
            case 'JoyToken':
                return this.getGameSessionLockedFunds(address, currency, location);
            default:
                return new Promise((resolve) => {
                    resolve(getETHBalanceCurrencyDoesNotExistResponse({currency, location}));
                });
        }
    }

    getEthWorld(address, currency, location) {
        return new Promise(async (resolve) => {
            const wei = await this.getWeiWorld(address);

            if (wei.error) {
                resolve(getETHBalanceConnectionProblemsResponse({currency, location}));
                return;
            }

            const balance = module.utils.fromWei(wei.balance, 'ether');

            resolve({currency, balance, location});
        });
    }

    getWeiWorld(address, currency, location) {
        return new Promise((resolve) => {
            module.eth.getBalance(address).then((balance) => {
                resolve({currency, balance, location});
            }).catch((error) => {
                console.error(error);
                resolve(getETHBalanceConnectionProblemsResponse({currency, location}));
            });
        });
    }

    getJoyTokenWorld(address, currency, location) {
        return new Promise((resolve) => {
            const Token = getTokenContract(module.eth.Contract);
            Token.methods.balanceOf(address).call().then((balance) => {
                resolve({currency, balance, location});
            }).catch((error) => {
                console.error(error);
                resolve(getETHBalanceConnectionProblemsResponse({currency, location}));
            });

        });
    }

    getPlatformDeposit(address, currency, location) {
        return new Promise((resolve) => {
            const Deposit = getDepositContract(module.eth.Contract);
            Deposit.methods.balanceOfPlayer(address).call().then((balance) => {
                resolve({currency, balance, location});
            }).catch((error) => {
                console.error(error);
                resolve(getETHBalanceConnectionProblemsResponse({currency, location}));
            });
        });
    }

    getGameSessionLockedFunds(address, currency, location) {
        return new Promise((resolve) => {
            const Deposit = getDepositContract(module.eth.Contract);
            Deposit.methods.playerLockedFunds(address).call().then((balance) => {
                resolve({currency, balance, location});
            }).catch((error) => {
                resolve(getETHBalanceConnectionProblemsResponse({currency, location, error}));
            });
        });
    }
}