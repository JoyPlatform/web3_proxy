import { ETHConfiguration } from 'configs/';

export function getContractOwnerAddress() {
    const { AccountAddress } = ETHConfiguration;

    return AccountAddress.contractsOwner;
}

export function getContractOwnerPassword() {
    const { contractOwnerPassword } = ETHConfiguration;

    return contractOwnerPassword;
}