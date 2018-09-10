import WebSocketServer from 'communicationServices/wsserver';
import {RESPONSE_STATUS_SUCCESS} from 'constants/messageStatuses';
import { getAppIncorrectCommandResponse } from 'components/app/responses/';

export default class BaseApp {

    constructor() {

    }

    initWSServer() {
        this.wsserver = new WebSocketServer();
    }

    sendResponseToClient(response) {
        this.wsserver.sendResponse(response);
    }

    sendResponseToClients(response, forAll) {
        this.wsserver.sendResponseToClients(response, forAll);
    }

    updateClientData(clientData) {
        this.wsserver.setClientProperty(clientData);
    }

    incorrectRequestedCommandHandler({response, command}) {
        response.data = getAppIncorrectCommandResponse(command);
        this.sendResponseToClient(response);
    }

    getServerVersion({response}) {
        const { data } = response;
        data.status = RESPONSE_STATUS_SUCCESS;
        /*eslint-disable */
        data.response = {version: COMMITHASH};
        /*eslint-enable */
        this.sendResponseToClient(response);
    }

    get clients() {
        return this.wsserver.getClients();
    }

}