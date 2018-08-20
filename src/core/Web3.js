import EventBus from 'common/EventBus';
import BaseWeb3 from 'common/baseWeb3';
import Web3Components from 'components/web3';

const { AuthComponent, BalanceComponent, ConfigurationController, TransferController, TokenController, OwnerController } = Web3Components;

export default class Web3 extends BaseWeb3 {

    constructor() {
        super();
        this.initialize();
    }

    async initialize() {
        await this.initWeb3Services();
        this.initComponents();
        this.initEventListeners();
        this.transactionsAmount = 0;
    }

    initComponents() {
        this.authComponent = new AuthComponent(this);
        this.balanceComponent = new BalanceComponent(this);
        this.configurationController = new ConfigurationController(this);
        this.transferController = new TransferController(this);
        this.tokenController = new TokenController(this);
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
        EventBus.on('Web3GetTransfersInProgress', this.transferController::this.transferController.getTransfersInProgress);
        EventBus.on('Web3TopUpTokens', this.addToOwnerTransactionsList.bind(this, this.tokenController, 'topUpTokens'));

    }

    addToOwnerTransactionsList(controller, method, params) {
        this.waitForUnlockRequests = { params, controller, method };
        this.executeOwnerTransactions();
    }

    async executeOwnerTransactions() {
        if (this.isOwnerAccountLocked === 0 && this.waitForUnlockRequests.length) {
            this.isOwnerAccountLocked = 1;

            const isAccountUnlocked = await this.ownerController.unlockOwnerAccount(500)
                .then((isAccountUnlocked) => {
                    return isAccountUnlocked;
                }).catch((e) => {
                    console.log(e);
                });

            console.info('isAccountUnlocked', isAccountUnlocked);

            const transactionsAmount = this.waitForUnlockRequests.length;
            for (let i = 0; i < 100; i++ ) {
                if (i < transactionsAmount) {
                    this.transactionsAmount++;
                    const { params, controller, method } = this.waitForUnlockRequests.shift();
                    controller[method](params);
                } else {
                    break;
                }
            }
        }
    }

    async onExecutedOwnerTransaction() {
        if (--this.transactionsAmount === 0) {
            await this.ownerController.lockOwnerAccount()
                .then((isAccountLocked) => {
                    console.info('is Account locked: ', isAccountLocked);
                   return isAccountLocked ? 0 : 1;
                });
            this.isOwnerAccountLocked = 0;
            this.executeOwnerTransactions();
        }
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