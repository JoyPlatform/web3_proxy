import expect from 'expect.js';
import sinon from 'sinon';
import EventBus from '../src/common/EventBus';
import { CLIENT_ACTION_GET_BALANCES } from '../src/constants/messageActions';

describe('Tests for MessageHandlerFactory', () => {

    describe('Tests for Incorrect request command', () => {
        it('incorrectRequestedCommand method should be called', () => {
            const spy = sinon.spy();

            EventBus.removeListener('incorrectRequestedCommand');
            EventBus.on('incorrectRequestedCommand', spy);
            EventBus.emit('onMessage', {command:'some incorrect command', data: {}}, {});
            expect(spy.calledOnce).to.be.ok();
        });

        it('incorrectRequestedCommand method should not be called', () => {
            const spy = sinon.spy();

            EventBus.removeListener('incorrectRequestedCommand');
            EventBus.on('incorrectRequestedCommand', spy);
            EventBus.emit('onMessage', {command: CLIENT_ACTION_GET_BALANCES, data: {}}, {});
            expect(spy.calledOnce).to.not.be.ok();
        }) ;
    });

    describe('Tests for addUsers request command', () => {
        it('addUsersToClient method should be called', () => {
            const spy = sinon.spy();

            EventBus.removeListener('addUsersToClient');
            EventBus.on('addUsersToClient', spy);
            EventBus.emit('onMessage', {command:'addUsers', data: {}}, {});
            expect(spy.calledOnce).to.be.ok();
        });
    });

    describe('Tests for getEntireContractsData request command', () => {
        it('Web3GetConfigurationData method should be called', () => {
            const spy = sinon.spy();

            EventBus.removeListener('Web3GetConfigurationData');
            EventBus.on('Web3GetConfigurationData', spy);
            EventBus.emit('onMessage', {command:'getEntireContractsData', data: {}}, {});
            expect(spy.calledOnce).to.be.ok();
        });
    });

    describe('Tests for isUserExist request command', () => {
        it('Web3Authentication method should be called', () => {
            const spy = sinon.spy();

            EventBus.removeListener('Web3Authentication');
            EventBus.on('Web3Authentication', spy);
            EventBus.emit('onMessage', {command:'isUserExist', data: {}}, {});
            expect(spy.calledOnce).to.be.ok();
        });
    });

    describe('Tests for transferToGame request command', () => {
        it('Web3TransferToGame method should be called', () => {
            const spy = sinon.spy();

            EventBus.removeListener('Web3TransferToGame');
            EventBus.on('Web3TransferToGame', spy);
            EventBus.emit('onMessage', {command:'transferToGame', data: {}}, {});
            expect(spy.calledOnce).to.be.ok();
        });
    });

    describe('Tests for getBalances request command', () => {
        it('Web3Balances method should be called', () => {
            const spy = sinon.spy();

            EventBus.removeListener('Web3Balances');
            EventBus.on('Web3Balances', spy);
            EventBus.emit('onMessage', {command:'getBalances', data: {}}, {});
            expect(spy.calledOnce).to.be.ok();
        });
    });

    describe('Tests for topUpTokens request command', () => {
        it('Web3Balances method should be called', () => {
            const spy = sinon.spy();

            EventBus.removeListener('Web3TopUpTokens');
            EventBus.on('Web3TopUpTokens', spy);
            EventBus.emit('onMessage', {command:'topUpTokens', data: {}}, {});
            expect(spy.calledOnce).to.be.ok();
        });
    });

    describe('Tests for transferFromGame request command', () => {
        it('Web3TransferFromGame method should be called', () => {
            const spy = sinon.spy();

            EventBus.removeListener('Web3TransferFromGame');
            EventBus.on('Web3TransferFromGame', spy);
            EventBus.emit('onMessage', {command:'transferFromGame', data: {}}, {});
            expect(spy.calledOnce).to.be.ok();
        });
    });

    describe('Tests for getWeb3ProxyVersion request command', () => {
        it('getServerVersion method should be called', () => {
            const spy = sinon.spy();

            EventBus.removeListener('getServerVersion');
            EventBus.on('getServerVersion', spy);
            EventBus.emit('onMessage', {command:'getWeb3ProxyVersion', data: {}}, {});
            expect(spy.calledOnce).to.be.ok();
        });
    });


    describe('Tests for getEntireContractsData request command', () => {
        it('Web3GetConfigurationData method should be called', () => {
            const spy = sinon.spy();

            EventBus.removeListener('Web3GetConfigurationData');
            EventBus.on('Web3GetConfigurationData', spy);
            EventBus.emit('onMessage', {command:'getEntireContractsData', data: {}}, {});
            expect(spy.calledOnce).to.be.ok();
        });
    });
});
