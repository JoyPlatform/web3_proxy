import EventBus from 'common/EventBus';
import BaseWeb3 from 'common/baseWeb3';
import Web3Components from 'components/web3';

const { AuthComponent, BalanceComponent, ConfigurationController, TransferComponent } = Web3Components;

export default class Web3 extends BaseWeb3 {

    constructor() {
        super();

        this.initEventListeners();
    }

    initComponents() {
        this.authComponent = new AuthComponent(this);
        this.balanceComponent = new BalanceComponent(this);
        this.configurationController = new ConfigurationController(this);
        this.transferComponent = new TransferComponent(this);
    }

    initEventListeners() {
        EventBus.on('Web3ConnectionStatus', (connectionStatus) => {
            if (this.connectionStatus !== connectionStatus) {
                this.connectionStatus = connectionStatus;
                console.info('SEND TO ALL CLIENTS NEW CONNECTION STATUS', connectionStatus);
            }
        });

        EventBus.on('Web3InitEventListeners', () => {
            this.initComponents();
            EventBus.on('Web3Authentication', this.authComponent::this.authComponent.isAddressExist);
            EventBus.on('Web3Balances', this.balanceComponent::this.balanceComponent.getBalances);
            EventBus.on('Web3GetConfigurationData', this.configurationController::this.configurationController.getBaseConfiguration);
            EventBus.on('Web3GetTransfersInProgress', this.transferComponent::this.transferComponent.getTransfersInProgress);
        });

        // EventBus.on('Web3RegisterTransfersToClient', this.transferComponent::this.transferComponent.registerTransfersToClient);
        // EventBus.on('executeWeb3Module', ::this.executeBaseComponent);
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

    executeWalletComponent(data) {
        EventBus.emit('startGameSession', {data});
    }

}