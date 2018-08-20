import { getContractOwnerAddress, getContractOwnerPassword } from '../contracts/owner';

let module = null;

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
}