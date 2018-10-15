import { ETHConfiguration, contractsConfiguration } from 'configs/';

export function getGameAddress() {
    const { ContractAddress } = ETHConfiguration;

    return ContractAddress.demoGame;
}

export function getGameABI() {
    return contractsConfiguration.JoyGameDemo.abi;
}

function getContractOwnerAddress() {
    const { AccountAddress } = ETHConfiguration;

    return AccountAddress.contractsOwner;
}

export function getGameContract(Contract, gasPrice) {
    return new Contract(
        getGameABI(),
        getGameAddress(), {
            from: getContractOwnerAddress(),
            gasPrice,
            gas: 1000000 // gas limit - The maximum gas provided for a transaction
        }
    );
}