import { ETHConfiguration, contractsConfiguration } from 'configs/';

export function getSubscriptionJoyTokenAddress() {
    const { ContractAddress } = ETHConfiguration;

    return ContractAddress.subscription.joyToken;
}

export function getSubscriptionEtherAddress() {
    const { ContractAddress } = ETHConfiguration;

    return ContractAddress.subscription.ether;
}

export function getSubscriptionJoyTokenABI() {
    return contractsConfiguration.SubscriptionWithJoyToken.abi;
}

export function getSubscriptionEtherABI() {
    return contractsConfiguration.SubscriptionWithEther.abi;
}