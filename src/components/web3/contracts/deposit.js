import {contractsConfiguration, ETHConfiguration} from 'configs/';

export function getDepositABI() {
    return contractsConfiguration.PlatformDeposit.abi;
}

export function getDepositAddress() {
    const { ContractAddress } = ETHConfiguration;

    return ContractAddress.deposit;
}

function getGasPrice() {
    return ETHConfiguration.gasPrice;
}

function getContractOwnerAddress() {
    const { AccountAddress } = ETHConfiguration;

    return AccountAddress.contractsOwner;
}

export function getDepositContract(Contract) {
    return new Contract(
        getDepositABI(),
        getDepositAddress(), {
            from: getContractOwnerAddress(),
            gasPrice: getGasPrice(),
            gas: 1000000 // gas limit - The maximum gas provided for a transaction
        }
    );
}