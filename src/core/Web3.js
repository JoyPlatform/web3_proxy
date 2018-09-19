import EventBus from 'common/EventBus';
import BaseWeb3 from 'common/baseWeb3';
import Web3Components from 'components/web3';
import {RESPONSE_STATUS_SUCCESS} from 'constants/messageStatuses';

const { AuthComponent, BalanceComponent, ConfigurationController, TransferListenerController, TransferExecuteController, OwnerController } = Web3Components;

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
        this.transferListenerController = new TransferListenerController(this);
        this.transferExecuteController = new TransferExecuteController(this);
        this.ownerController = new OwnerController(this);
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
        EventBus.on('Web3GetTransfersInProgress', ::this.getTransfersInProgress);
        EventBus.on('Web3TopUpTokens', this.addToOwnerTransactionsList.bind(this, this.transferExecuteController, 'topUpTokens'));
        EventBus.on('Web3TransferToGame', this.addToOwnerTransactionsList.bind(this, this.transferExecuteController, 'transferToGame'));
        EventBus.on('Web3TransferFromGame', this.addToOwnerTransactionsList.bind(this, this.transferExecuteController, 'transferFromGame'));

    }

    getTransfersInProgress({request, response}) {
        const { userIds } = request;
        const transactions = [];

        this.transactions.forEach((transaction) => {
            if (userIds.includes(transaction[Symbol.for('userId')])) {
                transactions.push(transaction[Symbol.for('status')]);
            }
        });

        response.data.status = RESPONSE_STATUS_SUCCESS;
        response.data.response = { transactions };

        this.sendResponseToClient(response);
    }

    addToOwnerTransactionsList(controller, method, params) {
        this.ownerController.addToOwnerTransactionsList(controller, method, params);
    }

    onExecutedOwnerTransaction() {
        this.ownerController.onExecutedOwnerTransaction();
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