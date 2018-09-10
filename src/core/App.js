import EventBus from 'common/EventBus';
import clientMessagesHandler, { parseRequestCommand } from 'messagesHandlers/clientMessagesHandler';
import web3MessagesHandler from 'messagesHandlers/web3MessagesHandler';
import BaseApp from 'common/baseApp';
import { MODULE_CLIENT, MODULE_WEB3 } from 'constants/modules';
import { RESPONSE_STATUS_SUCCESS } from 'constants/messageStatuses';

export default class App extends BaseApp {

    constructor(disableServer) {
        super();
        this.initEventListeners();
        !disableServer && this.initWSServer();
    }

    initEventListeners() {
        EventBus.on('onMessage', ::this.messageHandlerFactory);
        EventBus.on('incorrectRequestedCommand', ::this.incorrectRequestedCommandHandler);
        EventBus.on('getServerVersion', ::this.getServerVersion);
        EventBus.on('updateClientData', ::this.updateClientData);
        EventBus.on('sendResponseToClient', ::this.sendResponseToClient);
        EventBus.on('sendResponseToClients', ::this.sendResponseToClients);
        EventBus.on('addUsersToClient', ::this.addUsersToClient);
        EventBus.on('addUserToClient', ::this.addUserToClient);
    }

    addUserToClient(response) {
        const { wsclient, userExist, userId } = response;
        const usersKey = Symbol.for('userIds');

        if (userExist && !wsclient[usersKey].includes(userId)) {
            wsclient[usersKey].push(userId);
        }

        this.sendResponseToClient(response);
    }

    addUsersToClient({request, response}) {
        const { userIds } = request;
        const { wsclient, data } = response;

        this.updateClientData({wsclient, key: 'userIds', value: userIds});
        data.status = RESPONSE_STATUS_SUCCESS;
        this.sendResponseToClient(response);
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
                EventBus.emit('incorrectRequestedCommand', {response, command: method});
        }
    }
}