import WebSocketServer from 'communicationServices/wsserver';

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


    get clients() {
        return this.wsserver.getClients();
    }

}