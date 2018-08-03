import Web3 from 'web3';
import net from 'net';
import { ETHConfiguration } from 'configs/';

export default class Web3Service {

    constructor() {

        const web3 = this.setup();

        return {
            web3
        };
    }

    setup() {
        const { gethProviderSource, gethProviderType, gethSupportedTypes } = ETHConfiguration;

        if (!gethSupportedTypes.includes(gethProviderType)) {
            throw new Error(`Unsupported WEB3 provider type: ${gethProviderType}`);
        }

        return new Web3(gethProviderSource, gethProviderType === 'ipc' ? net : undefined);
    }
}