import { ERROR_APP_INCORRECT_COMMAND } from 'constants/errors';
import { RESPONSE_STATUS_ERROR } from 'constants/messageStatuses';

export function getAppIncorrectCommandResponse(command) {
    console.warn(ERROR_APP_INCORRECT_COMMAND, command);
    return {command: command + '', status: RESPONSE_STATUS_ERROR, error: ERROR_APP_INCORRECT_COMMAND};
}