import expect from 'expect.js';
import checkSchema from '../src/communicationServices/schemas';

describe('JSON Schema tests', () => {
    describe('General Tests Request Schema', () => {

        it('Should return false if incorrect request format', () => {
            const request = {};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return true if correct request format', () => {
            const request = {'command': 'isUserExist', 'data': { 'userId': '1' }};
            expect(checkSchema(request)).to.be.ok();
        });

        it('Should return false if request command does not exist', () => {
            const request = {'command': 'COMMAND_DOES_NOT_EXIST'};
            expect(checkSchema(request)).to.not.be.ok();
        });


    });


    describe('isUserExist and transferToGame Request Schema', () => {
        const isUserExistCommand = 'isUserExist';
        const transferToGameCommand = 'transferToGame';

        it('Should return false if no data property', () => {
            let request = {'command': isUserExistCommand};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': transferToGameCommand};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if data property has incorrect type', () => {
            let request = {'command': isUserExistCommand, 'data': null};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': transferToGameCommand, 'data': null};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if data is empty object', () => {
            let request = {'command': isUserExistCommand, 'data': {}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': transferToGameCommand, 'data': {}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if userId has type different from String', () => {
            let request = {'command': isUserExistCommand, 'data': {'userId': 1}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': isUserExistCommand, 'data': {'userId': true}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': isUserExistCommand, 'data': {'userId': []}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': isUserExistCommand, 'data': {'userId': {}}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': isUserExistCommand, 'data': {'userId': null}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': isUserExistCommand, 'data': {'userId': undefined}};
            expect(checkSchema(request)).to.not.be.ok();

            request = {'command': transferToGameCommand, 'data': {'userId': 1}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': transferToGameCommand, 'data': {'userId': true}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': transferToGameCommand, 'data': {'userId': []}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': transferToGameCommand, 'data': {'userId': {}}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': transferToGameCommand, 'data': {'userId': null}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': transferToGameCommand, 'data': {'userId': undefined}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return true if correct format', () => {
            let request = {'command': isUserExistCommand, 'data': {'userId': '0xfdjshjskfh'}};
            expect(checkSchema(request)).to.be.ok();
            request = {'command': transferToGameCommand, 'data': {'userId': '0xfdjshjskfh'}};
            expect(checkSchema(request)).to.be.ok();
        });
    });

    describe('getBalances Request Schema', () => {
        const getBalancesCommand = 'getBalances';

        it('Should return false if no data property', () => {
            const request = {'command': getBalancesCommand};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if data property has incorrect type', () => {
            const request = {'command': getBalancesCommand, 'data': null};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if data is empty object', () => {
            const request = {'command': getBalancesCommand, 'data': {}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if balances property does not exist', () => {
            const request = {'command': getBalancesCommand, 'data': {'userId': '123'}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if balances property does not exist', () => {
            const request = {'command': getBalancesCommand, 'data': {'userId': '123'}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if balances property is empty array', () => {
            const request = {'command': getBalancesCommand, 'data': {'userId': '123', 'balances':[]}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if balances property has incorrect value', () => {
            const request = {'command': getBalancesCommand, 'data': {'userId': '123', 'balances':[{}]}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return true if correct format', () => {
            const request = {'command': getBalancesCommand, 'data': {'userId': '123', 'balances':[{'currency': 'currency', 'locations': ['location1']}]}};
            expect(checkSchema(request)).to.be.ok();
        });
    });

    describe('getEntireContractsData Request Schema', () => {
        const getEntireContractsDataCommand = 'getEntireContractsData';

        it('Should not return false if no data property', () => {
            const request = {'command': getEntireContractsDataCommand};
            expect(checkSchema(request)).to.be.ok();
        });
    });

    describe('addUsers Request Schema', () => {
        const addUsersCommand = 'addUsers';

        it('Should return false if no data property', () => {
            const request = {'command': addUsersCommand};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if data property has incorrect type', () => {
            const request = {'command': addUsersCommand, 'data': null};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if data is empty object', () => {
            const request = {'command': addUsersCommand, 'data': {}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if userIds has incorrect type', () => {
            const request = {'command': addUsersCommand, 'data': {'userIds': ''}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if userIds is empty array', () => {
            const request = {'command': addUsersCommand, 'data': {'userIds': []}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if userIds items have incorrect type', () => {
            const request = {'command': addUsersCommand, 'data': {'userIds': [true,2,3, '23']}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return true if correct format', () => {
            const request = {'command': addUsersCommand, 'data': {'userIds': ['1', '2']}};
            expect(checkSchema(request)).to.be.ok();
        });
    });

    describe('topUpTokens Request Schema', () => {
        const topUpTokensCommand = 'topUpTokens';

        it('Should return false if no data property', () => {
            const request = {'command': topUpTokensCommand};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if data property has incorrect type', () => {
            const request = {'command': topUpTokensCommand, 'data': null};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if data is empty object', () => {
            const request = {'command': topUpTokensCommand, 'data': {}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if no userId property', () => {
            const request = {'command': topUpTokensCommand, 'data': {'amount': '123'}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if no amount property', () => {
            const request = {'command': topUpTokensCommand, 'data': {'userId': '0x123'}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if amount or userId properties have incorrect type', () => {
            let request = {'command': topUpTokensCommand, 'data': {'userId': '0x123', 'amount': 123}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': topUpTokensCommand, 'data': {'userId': 123, 'amount': '123'}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': topUpTokensCommand, 'data': {'userId': 123, 'amount': 123}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return true if correct format', () => {
            const request = {'command': topUpTokensCommand, 'data': {'userId': '0x757', 'amount': '123'}};
            expect(checkSchema(request)).to.be.ok();
        });
    });

    describe('transferFromGame Request Schema', () => {
        const transferFromGameCommand = 'transferFromGame';

        it('Should return false if no data property', () => {
            const request = {'command': transferFromGameCommand};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if data property has incorrect type', () => {
            const request = {'command': transferFromGameCommand, 'data': null};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if data is empty object', () => {
            const request = {'command': transferFromGameCommand, 'data': {}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return false if properties have incorrect type', () => {
            let request = {'command': transferFromGameCommand, 'data': {'userId': 0x757, 'balance': '123', 'gameProcessHash': '0x123'}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': transferFromGameCommand, 'data': {'userId': '0x757', 'balance': 123, 'gameProcessHash': '0x123'}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': transferFromGameCommand, 'data': {'userId': '0x757', 'balance': '123', 'gameProcessHash': 0x123}};
            expect(checkSchema(request)).to.not.be.ok();
            request = {'command': transferFromGameCommand, 'data': {'userId': 0x757, 'balance': 123, 'gameProcessHash': 0x123}};
            expect(checkSchema(request)).to.not.be.ok();
        });

        it('Should return true if correct format', () => {
            const request = {'command': transferFromGameCommand, 'data': {'userId': '0x757', 'balance': '123', 'gameProcessHash': '0x123'}};
            expect(checkSchema(request)).to.be.ok();
        });
    });

    describe('getEntireContractsData Request Schema', () => {
        const getEntireContractsDataCommand = 'getEntireContractsData';
        const getWeb3ProxyVersionCommand = 'getWeb3ProxyVersion';

        it('Should return true if no data property', () => {
            let request = {'command': getEntireContractsDataCommand};
            expect(checkSchema(request)).to.be.ok();

            request = {'command': getWeb3ProxyVersionCommand};
            expect(checkSchema(request)).to.be.ok();
        });
    });
});

