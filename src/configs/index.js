import _ from 'lodash';

/*eslint-disable */
const { server, ETH } = APP_CONFIG;
const Contracts = APP_CONTRACTS;
/*eslint-enable */

export const serverConfiguration = _.get({}, 'server', server);
export const ETHConfiguration = _.get({}, 'ETH', ETH);
export const contractsConfiguration = Contracts;
