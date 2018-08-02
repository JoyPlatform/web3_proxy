import { RESPONSE_STATUS_SUCCESS } from 'constants/messageStatuses';

let module = null;

export default class AuthComponent {

    constructor(baseModule) {
        module = baseModule;
    }

    isAddressExist({request, callbackEmit, response}) {
        const { userId } = request;

        response.userExist = module.utils.isAddress(userId);
        response.clientId = userId;
        response.data.response = {clientId: userId};
        response.data.status = RESPONSE_STATUS_SUCCESS;
        if (callbackEmit) {
            module.executeEmitCallback(callbackEmit, response);
        }
    }

}