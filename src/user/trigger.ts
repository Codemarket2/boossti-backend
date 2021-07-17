import {
  PreSignUpTriggerEvent,
  PostAuthenticationTriggerEvent,
  PostConfirmationTriggerEvent,
} from 'aws-lambda';
import {
  preSignUpTrigger,
  postAuthenticationTrigger,
  // postConfirmationTrigger,
} from './utils/cognitoTriggers';

export const handler = async (
  event:
    | PreSignUpTriggerEvent
    | PostConfirmationTriggerEvent
    | PostAuthenticationTriggerEvent
): Promise<any> => {
  if (event.triggerSource && event.triggerSource.includes('PreSignUp_')) {
    return await preSignUpTrigger(event);
  }
  if (
    event.triggerSource &&
    event.triggerSource === 'PostAuthentication_Authentication'
  ) {
    return await postAuthenticationTrigger(event);
  }
  // if (
  //   event.triggerSource &&
  //   event.triggerSource === 'PostConfirmation_ConfirmSignUp'
  // ) {
  //   return await postConfirmationTrigger(event);
  // }
  return event;
};
