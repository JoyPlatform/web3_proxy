import EventBus from 'common/EventBus';
import BaseWeb3 from 'common/baseWeb3';
import Web3Components from 'components/web3';

const { AuthComponent, BalanceComponent, ConfigurationController, TransferController } = Web3Components;

export default class Web3 extends BaseWeb3 {

    constructor() {
        super();
        this.initialize();
    }

    async initialize() {
        await this.initWeb3Services();
        this.initComponents();
        this.initEventListeners();
    }

    initComponents() {
        this.authComponent = new AuthComponent(this);
        this.balanceComponent = new BalanceComponent(this);
        this.configurationController = new ConfigurationController(this);
        this.transferController = new TransferController(this);
    }

    initEventListeners() {
        EventBus.on('Web3ConnectionStatus', (connectionStatus) => {
            if (this.connectionStatus !== connectionStatus) {
                this.connectionStatus = connectionStatus;
                console.info('SEND TO ALL CLIENTS NEW CONNECTION STATUS', connectionStatus);
            }
        });

        EventBus.on('Web3Authentication', this.authComponent::this.authComponent.isAddressExist);
        EventBus.on('Web3Balances', this.balanceComponent::this.balanceComponent.getBalances);
        EventBus.on('Web3GetConfigurationData', this.configurationController::this.configurationController.getBaseConfiguration);
        EventBus.on('Web3GetTransfersInProgress', this.transferController::this.transferController.getTransfersInProgress);

    }

    executeEmitCallback(event, data) {
        EventBus.emit(event, data);
    }

    sendResponseToClient(response) {
        EventBus.emit('sendResponseToClient', response);
    }

    sendResponseToClients(response) {
        EventBus.emit('sendResponseToClients', response);
    }

}