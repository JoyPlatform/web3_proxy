import _ from 'lodash';
// import APP_CONFIG from '../../configs/config.json';
// import APP_CONTRACTS from '../../configs/contracts.json';

/*eslint-disable */
const { server, ETH } = APP_CONFIG;
const Contracts = APP_CONTRACTS;
/*eslint-enable */

export const serverConfiguration = _.get({}, 'server', server);
export const ETHConfiguration = _.get({}, 'ETH', ETH);
export const contractsConfiguration = Contracts;
