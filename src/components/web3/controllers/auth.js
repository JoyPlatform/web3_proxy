import { RESPONSE_STATUS_SUCCESS } from 'constants/messageStatuses';

let module = null;

export default class AuthComponent {

    constructor(baseModule) {
        module = baseModule;
    }

    isAddressExist({request, callbackEmit, response}) {
        const { userId } = request;

        response.userExist = module.utils.isAddress(userId);
        response.data.response = {userId, exist: response.userExist};
        response.data.status = RESPONSE_STATUS_SUCCESS;
        if (callbackEmit) {
            module.executeEmitCallback(callbackEmit, response);
        }
    }

}