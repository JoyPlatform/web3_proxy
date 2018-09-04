import 'babel-polyfill';
import expect from 'expect.js';
import OwnerController from '../src/components/web3/controllers/owner';

const module = {};
const ownerController = new OwnerController(module);

ownerController.unlockOwnerAccount = function() {
    return new Promise((resolve) => {
        setTimeout(function() {
            resolve(false);
        }, 5);
    });
};
ownerController.lockOwnerAccount = function() {
    return new Promise((resolve) => {
        setTimeout(function() {
            resolve(true);
        }, 5);
    });
};

describe('Tests for Owner Controller', () => {
    it('WaitForUnlockRequests amount should be equal 0', () => {
        expect(ownerController.waitForUnlockRequests.length).to.be.equal(0);
    });

    it('WaitForUnlockRequests amount should be equal 1', (done) => {
        const params = {};
        const controller = {
            method: () => {
                setTimeout(()=> {
                    ownerController.onExecutedOwnerTransaction();
                    done();
                }, 10);
            }
        };
        const method = 'method';

        ownerController.addToOwnerTransactionsList(controller, method, params);
        expect(ownerController.waitForUnlockRequests.length).to.be.equal(1);
    });

    it('WaitForUnlockRequests amount should be equal 50', (done) => {
        let counter = 0;
        for (let i = 0; i < 50; i++) {
            const params = {};
            const controller = {
                method: () => {
                    setTimeout(()=> {
                        ownerController.onExecutedOwnerTransaction();
                        if (++counter === 50) {
                            done();
                        }
                    }, 0);
                }
            };
            const method = 'method';
            ownerController.addToOwnerTransactionsList(controller, method, params);
        }

        expect(ownerController.waitForUnlockRequests.length).to.be.equal(50);
    });

    it('WaitForUnlockRequests amount should be equal 0 after executions', (done) => {
        let counter = 0;
        for (let i = 0; i < 50; i++) {
            const params = {};
            const controller = {
                method: () => {
                    setTimeout(()=> {
                        ownerController.onExecutedOwnerTransaction();
                        if (++counter === 50) {
                            expect(ownerController.waitForUnlockRequests.length).to.be.equal(0);
                            done();
                        }
                    }, 0);
                }
            };
            const method = 'method';
            ownerController.addToOwnerTransactionsList(controller, method, params);
        }

        expect(ownerController.waitForUnlockRequests.length).to.be.equal(50);
    });
});