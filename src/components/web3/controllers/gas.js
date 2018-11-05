import BN from 'bn.js';
import _ from 'lodash';
import Web3 from 'web3';
import { ETHConfiguration } from 'configs/';

let module = null;
const SAMPLE_SIZE = 50;
const ALLOWED_WAIT = 60;
const PROBABILITY = ETHConfiguration.gasPriceProbability;
const RECALCULATE_GAS_PRICE_PER_BLOCKS = ETHConfiguration.recalculateGasPricePerBlocks;
const web3 = new Web3('https://mainnet.infura.io');
let gasPriceFromBlock = 0;

export default class GasController {

    constructor(baseModule) {
        module = baseModule;
        web3.eth.getBlock('latest').then((latest) => {
            this.getGasPrice(latest.number);
        });
    }

    async getAvgBlockTime(sampleSize = SAMPLE_SIZE) {
        return new Promise(async (resolve) => {
            const latest = await web3.eth.getBlock('latest');
            const oldest = await web3.eth.getBlock(latest.number - sampleSize);

            resolve({avgBlockTime: (latest.timestamp - oldest.timestamp) / SAMPLE_SIZE, latest});
        });

    }

    getBlocks(sampleSize = SAMPLE_SIZE, latest) {
        return new Promise((resolve) => {
            const blocks = [];

            blocks.push(latest);
            for (let i = 0; i < sampleSize; i++) {
                blocks.push(web3.eth.getBlock(latest.number - i, true));
            }

            Promise.all(blocks).then((data) => {
                resolve(data);
            }).catch(function(err) {
                console.error(err);
                resolve(false);
            });
        });
    }

    *getRawMinerData(blocks) {
        console.info('getRawMinerData');
        for (let i = 0; i < blocks.length; i++ ) {
            const block = blocks[i];
            for (let j = 0; j < _.get(block, 'transactions.length', 0); j++ ) {
                const transaction = block.transactions[j];

                if (transaction.gasPrice) {
                    yield [block.miner, block.hash, Number(transaction.gasPrice)];
                }
            }
        }
    }

    *aggregateMinerData(rawData) {
        const dataByMiner = _.groupBy([...rawData], 1);

        for (let miner in dataByMiner) {
            const blockHashes = [];
            const gasPrices = [];

            for (let i = 0; i < dataByMiner[miner].length; i++) {
                blockHashes.push(dataByMiner[miner][i][1]);
                gasPrices.push(dataByMiner[miner][i][2]);
            }

            yield [miner, 1, _.min(gasPrices)];
        }
    }

    *computeProbabilities(minerData, waitBlocks, sampleSize) {

        const minerDataByPrice = _.orderBy([...minerData], (data) => { return data[2]; }, ['desc']);

        for (let i = 0; i < minerDataByPrice.length; i++) {
            const minGasPrice = minerDataByPrice[i][2];
            const numBlocksAcceptingPrice = _.sumBy(minerDataByPrice.slice(i), (data) => { return data[1]; });
            const invProbPerBlock = (sampleSize - numBlocksAcceptingPrice) / sampleSize;
            const probabilityAccepted = (1 - invProbPerBlock) ** waitBlocks;

            yield [minGasPrice, probabilityAccepted];
        }
    }

    computeGasPrice(probabilities, desiredProbability) {
        const first = probabilities[0];
        const last = probabilities[probabilities.length - 1];

        if (desiredProbability >= first[1]) {
            return first[0];
        }
        else if (desiredProbability <= last[1]) {
            return last[0];
        }

        for (let i = 0; i < probabilities.length - 1; i++){
            const left = probabilities[i];
            const right = probabilities[i+1];

            if (desiredProbability < right[1]) {
                continue;
            } else if (desiredProbability > left[1]) {
                console.error('Can not calculate Gas Price');
                continue;
            }

            const adjProb = desiredProbability - right[1];
            const windowSize = left[1] - right[1];
            const position = adjProb / windowSize;
            const gasWindowSize = left[0] - right[0];
            const gasPrice = parseInt(Math.ceil(right[0] + gasWindowSize * position));

            return gasPrice;
        }

    }

    async getGasPrice(currentBlock) {

        if (Math.abs(currentBlock - gasPriceFromBlock) > RECALCULATE_GAS_PRICE_PER_BLOCKS) {
            gasPriceFromBlock = currentBlock;
            const { avgBlockTime, latest} = await this.getAvgBlockTime();
            console.info('AVG BLOCK TIME:', avgBlockTime);
            const waitBlocks = parseInt(Math.ceil(ALLOWED_WAIT / avgBlockTime));
            console.log('WAIT BLOCKS:', waitBlocks);
            const blocks = await this.getBlocks(SAMPLE_SIZE, latest);
            if (!blocks) {
                gasPriceFromBlock = 1;
                return false;
            }
            const rawData = this.getRawMinerData(blocks);
            const minerData = this.aggregateMinerData(rawData);
            const probabilities = this.computeProbabilities(minerData, waitBlocks, SAMPLE_SIZE);
            const gasPrice = this.computeGasPrice([...probabilities], PROBABILITY / 100);
            console.log('GAS PRICE (wei)', gasPrice);
            console.log('GAS PRICE (gwei)', web3.utils.fromWei(new BN(gasPrice), 'gwei'));
            if (gasPrice) {
                module.gasPrice = gasPrice.toString();
            }
        }

    }
}