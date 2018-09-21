import { getContractOwnerAddress, getContractOwnerPassword } from '../contracts/owner';

let module = null;
let isOwnerAccountLocked = true;
const waitForUnlockRequests = [];
let transactionsAmount = 0;

export default class OwnerController {

    constructor(baseModule) {
        module = baseModule;
    }

    unlockOwnerAccount(time = 10) {
        return module.eth.personal.unlockAccount(
            getContractOwnerAddress(),
            getContractOwnerPassword(),
            time
        );
    }

    lockOwnerAccount() {
        return module.eth.personal.lockAccount(getContractOwnerAddress());
    }

    addToOwnerTransactionsList(controller, method, params) {
        waitForUnlockRequests.push({ params, controller, method });
        this.executeOwnerTransactions();
    }

    executeOwnerTransactions() {

        if (isOwnerAccountLocked && waitForUnlockRequests.length) {
            isOwnerAccountLocked = false;
            module.eth.getBlockNumber().then(async (fromBlock) => {
                isOwnerAccountLocked = await this.unlockOwnerAccount(500)
                    .then((isAccountUnlocked) => {
                        return !isAccountUnlocked;
                    }).catch((e) => {
                        console.log('unlockOwnerAccount', e);
                    });

                for (let i = 0; i < 100; i++ ) {
                    if (i < waitForUnlockRequests.length) {
                        transactionsAmount++;
                        const { params, controller, method } = waitForUnlockRequests.shift();
                        controller[method](params, fromBlock);
                    } else {
                        break;
                    }
                }
            }).catch((e) => {
                console.error('executeOwnerTransactions getBlockNumber', e);
            });
        }
    }

    async onExecutedOwnerTransaction() {
        if (--transactionsAmount === 0) {
            isOwnerAccountLocked = await this.lockOwnerAccount()
                .then((isAccountLocked) => {
                    return isAccountLocked;
                }).catch((e) => {
                    console.error('lockOwnerAccount', e);
                });

            this.executeOwnerTransactions();
        }
    }

    get waitForUnlockRequests() {
        return waitForUnlockRequests;
    }
}



/*



 get isOwnerAccountLocked() {
        return isOwnerAccountLocked;
    }

    set isOwnerAccountLocked(isLocked) {
        isOwnerAccountLocked = isLocked;
    }


 */