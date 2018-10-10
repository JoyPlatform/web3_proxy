import _ from 'lodash';

let module = null;
const SAMPLE_SIZE = 10;
const ALLOWED_WAIT = 60;
// const PROBABIITY = 95;

export default class GasController {

    constructor(baseModule) {
        module = baseModule;

    }

    async getAvgBlockTime(sampleSize = SAMPLE_SIZE) {
        return new Promise(async (resolve) => {
            const latest = await module.eth.getBlock('latest');
            const oldest = await module.eth.getBlock(latest.number - sampleSize);

            resolve((latest.timestamp - oldest.timestamp) / SAMPLE_SIZE);
        });

    }

    getBlocks(sampleSize = SAMPLE_SIZE) {
        return new Promise(async (resolve) => {
            const blocks = [];
            const latest = await module.eth.getBlock('latest', true);

            blocks.push(latest);
            for (let i = 0; i < sampleSize; i++) {
                blocks.push(await module.eth.getBlock(latest.number - i, true));
            }

            resolve(blocks);
        });
    }

    *getRawMinerData(blocks) {
        for (let i = 0; i < blocks.length; i++ ) {
            const block = blocks[i];
            for (let j = 0; j < block.transactions.length; j++ ) {
                const transaction = block.transactions[j];

                if (transaction.gasPrice) {
                    yield [block.miner, block.hash, transaction.gasPrice];
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
            yield [miner, blockHashes.length, _.min(gasPrices)];
        }
    }

    async getGasPrice() {
        const avgBlockTime = await this.getAvgBlockTime();
        console.info('getAvgBlockTime', avgBlockTime);

        const waitBlocks = parseInt(Math.ceil(ALLOWED_WAIT / avgBlockTime));
        console.info(waitBlocks);
        const blocks = await this.getBlocks();
        const rawData = this.getRawMinerData(blocks);
        const minerData =this.aggregateMinerData(rawData);

console.log([...minerData]);
    }
}