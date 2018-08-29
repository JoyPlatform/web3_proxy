import { ETHConfiguration, contractsConfiguration } from 'configs/';

export function getGameAddress() {
    const { ContractAddress } = ETHConfiguration;

    return ContractAddress.demoGame;
}

export function getGameABI() {
    return contractsConfiguration.JoyGameDemo.abi;
}

function getGasPrice() {
    return ETHConfiguration.gasPrice;
}

function getContractOwnerAddress() {
    const { AccountAddress } = ETHConfiguration;

    return AccountAddress.contractsOwner;
}

export function getGameContract(Contract) {
    return new Contract(
        getGameABI(),
        getGameAddress(), {
            from: getContractOwnerAddress(),
            gasPrice: getGasPrice(),
            gas: 1000000 // gas limit - The maximum gas provided for a transaction
        }
    );
}