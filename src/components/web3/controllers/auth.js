import { RESPONSE_STATUS_SUCCESS } from 'constants/messageStatuses';

let module = null;

export default class AuthComponent {

    constructor(baseModule) {
        module = baseModule;
    }

    isAddressExist({request, callbackEmit, response}) {
        const { userId, withState } = request;

        response.userExist = module.utils.isAddress(userId);
        response.data.response = {userId, exist: response.userExist};

        if (response.userExist && withState) {
            response.data.response.transactions = module.transferController.getTransactionsByUserId(userId);
        }

        response.data.status = RESPONSE_STATUS_SUCCESS;
        response.userId = userId;
        if (callbackEmit) {
            module.executeEmitCallback(callbackEmit, response);
        }
    }

}