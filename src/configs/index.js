import BaseConfig from './base_config.json';
import Config from './config.json';
import Contracts from './contracts';
import _ from 'lodash';

const { server, ETH } = BaseConfig;

if (_.isEmpty(Config)) {
    throw new Error('Server config.json should be created');
}

export const serverConfiguration = _.get(Config, 'server', server);
export const ETHConfiguration = _.get(Config, 'ETH', ETH);
export const contractsConfiguration = Contracts;
