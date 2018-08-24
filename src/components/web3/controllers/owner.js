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

    async executeOwnerTransactions() {
        const waitForUnlockRequestsLength = waitForUnlockRequests.length;

        if (isOwnerAccountLocked && waitForUnlockRequestsLength) {
            isOwnerAccountLocked = true;

            isOwnerAccountLocked = await this.unlockOwnerAccount(500)
                .then((isAccountUnlocked) => {
                    return !isAccountUnlocked;
                }).catch((e) => {
                    console.log(e);
                });

            console.info('isOwnerAccountLocked', isOwnerAccountLocked);

            for (let i = 0; i < 100; i++ ) {
                if (i < waitForUnlockRequestsLength) {
                    transactionsAmount++;
                    const { params, controller, method } = waitForUnlockRequests.shift();
                    controller[method](params);
                } else {
                    break;
                }
            }
        }
    }

    async onExecutedOwnerTransaction() {
        if (--transactionsAmount === 0) {
            isOwnerAccountLocked = await this.lockOwnerAccount()
                .then((isAccountLocked) => {
                    console.info('isOwnerAccountLocked: ', isAccountLocked);
                    return isAccountLocked;
                });

            this.executeOwnerTransactions();
        }
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