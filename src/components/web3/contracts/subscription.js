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

function getContractOwnerAddress() {
    const { AccountAddress } = ETHConfiguration;

    return AccountAddress.contractsOwner;
}

export function getSubscriptionContract(Contract, gasPrice) {
    return new Contract(
        getSubscriptionEtherABI(),
        getSubscriptionEtherAddress(),
        {
            from: getContractOwnerAddress(), // default 'from' address
            gasPrice,
            gas: 1000000 // gas limit - The maximum gas provided for a transaction
        }
    );
}