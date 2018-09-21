import EventBus from 'common/EventBus';
import BaseWeb3 from 'common/baseWeb3';
import Web3Components from 'components/web3';
import { WEB3_CONNECTION_TO_ETH } from 'constants/messageActions';

const {
    AuthComponent,
    BalanceComponent,
    ConfigurationController,
    TransferListenerController,
    TransferExecuteController,
    OwnerController,
    TransferController
} = Web3Components;

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
        this.transferListenerController = new TransferListenerController(this);
        this.transferExecuteController = new TransferExecuteController(this);
        this.ownerController = new OwnerController(this);
    }

    initEventListeners() {
        EventBus.on('Web3ConnectionStatus', (connectionStatus) => {
            if (this.connectionStatus !== connectionStatus) {
                this.connectionStatus = connectionStatus;
                console.info('SEND TO ALL CLIENTS NEW CONNECTION STATUS', connectionStatus);
                // connectionStatus && this.transferListenerController.registerTransfers();
                const response = {
                    data: {
                        status: Number(!connectionStatus),
                        command: WEB3_CONNECTION_TO_ETH
                    }
                };
                this.sendResponseToClients(response, true);
            }
        });

        EventBus.on('Web3Authentication', this.authComponent::this.authComponent.isAddressExist);
        EventBus.on('Web3Balances', this.balanceComponent::this.balanceComponent.getBalances);
        EventBus.on('Web3GetConfigurationData', this.configurationController::this.configurationController.getBaseConfiguration);
        EventBus.on('Web3GetTransfersInProgress', this.transferController::this.transferController.getTransfersInProgress);
        EventBus.on('Web3TopUpTokens', this.addToOwnerTransactionsList.bind(this, this.transferExecuteController, 'topUpTokens'));
        EventBus.on('Web3TransferToGame', this.addToOwnerTransactionsList.bind(this, this.transferExecuteController, 'transferToGame'));
        EventBus.on('Web3TransferFromGame', this.addToOwnerTransactionsList.bind(this, this.transferExecuteController, 'transferFromGame'));
        EventBus.on('Web3NewBlockHeaders', ::this.onNewBlockHeaders);
    }

    onNewBlockHeaders(block) {
        this.transferController.checkTransactions(block);
        console.info('Transactions in Progress: ', Object.keys(this.transferController.transactions).length);
    }

    addTransaction(transaction) {
        this.transferController.transactions = transaction;
    }

    updateTransactionMined(transaction) {
        this.transferController.updateTransactionMined = transaction;
    }

    removeTransaction(transaction) {
        this.transferController.removeTransaction(transaction);
    }

    isTransactionExist(transaction) {
        return this.transferController.isTransactionExist(transaction);
    }

    forceCheckFailedTransactions() {
        this.transferController.forceCheckFailedTransactions();
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

    sendResponseToClients(response, forAll) {
        EventBus.emit('sendResponseToClients', response, forAll);
    }

}