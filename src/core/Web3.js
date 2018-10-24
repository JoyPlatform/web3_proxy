import EventBus from 'common/EventBus';
import BaseWeb3 from 'common/baseWeb3';
import Web3Components from 'components/web3';
import { WEB3_CONNECTION_TO_ETH } from 'constants/messageActions';
import { getUserDoesNotExistResponse } from 'components/web3/responses/';

const {
    AuthComponent,
    BalanceComponent,
    ConfigurationController,
    TransferListenerController,
    TransferExecuteController,
    OwnerController,
    TransferController,
    GasController
} = Web3Components;

export default class Web3 extends BaseWeb3 {

    constructor() {
        super();
        this.initialize();
    }

    async initialize() {
        this.onNewClientHandler();
        this.initGasComponent();
        await this.initWeb3Services();
        this.initComponents();
        this.initEventListeners();
    }

    onNewClientHandler() {
        EventBus.on('Web3ConnectionStatusForNewClient', ({response}) => {
            response.data.status = Number(!this.connectionStatus);
            this.sendResponseToClient(response);
        });
    }

    initGasComponent() {
        this.gasController = new GasController(this);
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
                connectionStatus && this.transferListenerController.registerTransfers();
                const response = {
                    data: {
                        command: WEB3_CONNECTION_TO_ETH,
                        status: Number(!connectionStatus)
                    }
                };
                this.sendResponseToClients(response, true);
            }
        });

        EventBus.on('Web3Authentication', this.authComponent::this.authComponent.isAddressExist);
        EventBus.on('Web3Balances', this.commonRequestPreparation.bind(this, this.balanceComponent::this.balanceComponent.getBalances));
        EventBus.on('Web3GetConfigurationData', this.configurationController::this.configurationController.getBaseConfiguration);
        EventBus.on('Web3GetTransfersInProgress', this.transferController::this.transferController.getTransfersInProgress);
        EventBus.on('Web3TransactionStatus', this.transferController::this.transferController.getTransactionStatus);

        EventBus.on('Web3TopUpTokens', this.addToOwnerTransactionsList.bind(this, this.transferExecuteController, 'topUpTokens'));
        EventBus.on('Web3TransferToGame', this.addToOwnerTransactionsList.bind(this, this.transferExecuteController, 'transferToGame'));
        EventBus.on('Web3TransferFromGame', this.addToOwnerTransactionsList.bind(this, this.transferExecuteController, 'transferFromGame'));

        EventBus.on('Web3NewBlockHeaders', ::this.onNewBlockHeaders);
    }

    onNewBlockHeaders(blockNumber) {
        this.transferController.checkTransactions(blockNumber);
        this.gasController.getGasPrice(blockNumber);
        console.info('onNewBlockHeaders', blockNumber);
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

    async commonRequestPreparation(fnExec, params) {
        const { request, response } = params;
        const result = await this.validateUserId(request, response);

        result && fnExec(params);
    }

    async addToOwnerTransactionsList(controller, method, params) {
        const { request, response } = params;
        const result = await this.validateUserId(request, response);

        result && this.ownerController.addToOwnerTransactionsList(controller, method, params);
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

    validateUserId(request, response) {
        const { userId } = request;
        return new Promise((resolve) => {
            if (this.utils.isAddress(userId)) {
                resolve(true);
            } else {
                response.data.response = getUserDoesNotExistResponse(userId);
                this.sendResponseToClient(response);
                resolve(false);
            }
        });
    }

}