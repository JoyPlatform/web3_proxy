import {contractsConfiguration, ETHConfiguration} from 'configs/';

export function getJoyTokenABI() {
    return contractsConfiguration.JoyToken.abi;
}

export function getTokenAddress() {
    const { ContractAddress } = ETHConfiguration;

    return ContractAddress.joyToken;
}

function getContractOwnerAddress() {
    const { AccountAddress } = ETHConfiguration;

    return AccountAddress.contractsOwner;
}

export function getTokenContract(Contract, gasPrice) {
    console.log(gasPrice);
    return new Contract(
        getJoyTokenABI(),
        getTokenAddress(),
        {
            from: getContractOwnerAddress(), // default 'from' address
            gasPrice,
            gas: 1000000 // gas limit - The maximum gas provided for a transaction
        }
    );
}