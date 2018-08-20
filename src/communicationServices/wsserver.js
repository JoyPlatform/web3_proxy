import WebSocket from 'ws';
import EventBus from 'common/EventBus';
import CheckSchema from './schemas';
import { serverConfiguration } from 'configs/';
import { RESPONSE_STATUS_ERROR } from 'constants/messageStatuses';
import { ERROR_INAPPROPRIATE_REQUEST_MESSAGE_FORMAT } from 'constants/errors';
import _ from 'lodash';

export default class WebSocketServer {
    constructor() {
        this.wsserver = null;
        this.wsclient = null;
        this.wsclients = [];
        this.setup();
        return {
            setClientProperty: ::this.clientProperty,
            sendResponse: ::this.sendToClient,
            sendResponseToClients: ::this.sendToClients,
            getClients: () => this.wsclients
        };
    }

    setup() {
        const { host, path, port } = serverConfiguration;

        this.wsserver = new WebSocket.Server({ host, path, port });
        this.wsserver.on('connection', ::this.connection);
        console.info('Web Server Status: STARTED\n');
    }

    getClientsById(id) {
        return _.filter(this.wsclients, (client) => { return client[Symbol.for('userIds')].includes(id); });
    }

    get server() {
        return this.wsserver;
    }

    clientProperty({wsclient, key, value}) {
        wsclient[Symbol.for(key)] = value;
    }

    connection(wsclient) {

        this.wsclients.push(wsclient);
        wsclient[Symbol.for('userIds')] = [];
        wsclient.removeFromArray = (wsclient) => {
            const clientIndex = this.wsclients.indexOf(wsclient);
            if (~clientIndex) {
                this.wsclients = [...this.wsclients.slice(0, clientIndex), ...this.wsclients.slice(clientIndex+1)];
            }
        };
        wsclient.on('message', wsclient::this.message);
        wsclient.on('error', wsclient::this.error);
    }

    message(clientRequest) {
        try {
            const request = JSON.parse(clientRequest);
            if (CheckSchema(request)) {
                const { command } = request;
                const response = {wsclient: this, data: {command: `${command}_Res`, status: RESPONSE_STATUS_ERROR}};

                // _.set(request, 'data.clientId', this.id || 0);
                EventBus.emit('onMessage', request, response);
            } else {
                const errorResponse = {status: RESPONSE_STATUS_ERROR, error: ERROR_INAPPROPRIATE_REQUEST_MESSAGE_FORMAT, requested: clientRequest};
                this.send(JSON.stringify(errorResponse));
            }
        } catch (e) {
            const errorResponse = {status: RESPONSE_STATUS_ERROR, error: ERROR_INAPPROPRIATE_REQUEST_MESSAGE_FORMAT, requested: clientRequest};
            this.send(JSON.stringify(errorResponse));
            console.error('error', e);
        }
    }

    sendToClient(response) {
        const { wsclient, data } = response;

        this.send(wsclient, data);
    }

    send(client, response) {
        try {
            client.send(JSON.stringify(response));
        } catch (e) {
            client.terminate();
            client.removeFromArray(client);
        }
    }

    sendToClients(response, forAll = false) {
        let { userId, data } = response;
        console.info('sendToClients by ', userId);
        let clients = [];

        if (!forAll) {
            clients = this.getClientsById(userId);
        }

        console.log('clients.length', clients.length);
        clients.forEach((client) => {
            this.send(client, data);
        });
    }

    error() {
        this.terminate();
        this.removeFromArray(this);
    }
}