import { ETHConfiguration, contractsConfiguration } from 'configs/';

export function getGameAddress() {
    const { ContractAddress } = ETHConfiguration;

    return ContractAddress.demoGame;
}

export function getGameABI() {
    return contractsConfiguration.JoyGameDemo.abi;
}