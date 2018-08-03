import EventBus from 'common/EventBus';
import clientMessagesHandler, { parseRequestCommand } from 'messagesHandlers/clientMessagesHandler';
import web3MessagesHandler from 'messagesHandlers/web3MessagesHandler';
import BaseApp from 'common/baseApp';
import { MODULE_CLIENT, MODULE_WEB3 } from 'constants/modules';
import { getAppIncorrectCommandResponse } from 'components/app/responses/';

export default class App extends BaseApp {

    constructor() {
        super();
        this.initEventListeners();
        this.initWSServer();
    }

    initEventListeners() {
        EventBus.on('onMessage', ::this.messageHandlerFactory);
        EventBus.on('incorrectRequestedCommand', ::this.incorrectRequestedCommandHandler);
        EventBus.on('authUserVerification', ::this.authUserVerification);
        EventBus.on('updateClientData', ::this.updateClientData);
        EventBus.on('sendResponseToClient', ::this.sendResponseToClient);
        EventBus.on('sendResponseToClients', ::this.sendResponseToClients);
    }

    incorrectRequestedCommandHandler({response, command}) {
        response.data = getAppIncorrectCommandResponse(command);
        this.sendResponseToClient(response);
    }

    authUserVerification(response) {
        const { clientId } = response;

        if (response.userExist) {
            this.updateClientData({wsclient: response.wsclient, key: 'id', value: clientId});
            this.sendResponseToClient(response);
        }
    }

    messageHandlerFactory({command, data}, response) {
        const { module, method } = parseRequestCommand(command);

        switch (module) {
            case MODULE_CLIENT:
                clientMessagesHandler({method: method, request: data, response});
                break;
            case MODULE_WEB3:
                web3MessagesHandler({method: method, request:data, response});
                break;
            default:
                EventBus.emit('incorrectRequestedCommand', {response, command: module});
        }
    }
}