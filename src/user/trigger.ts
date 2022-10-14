import {
  PreSignUpTriggerEvent,
  PostAuthenticationTriggerEvent,
  PostConfirmationTriggerEvent,
} from 'aws-lambda';
import {
  preSignUpTrigger,
  postAuthenticationTrigger,
  postConfirmationSignupTrigger,
} from './utils/cognitoTriggers';

export const handler = async (
  event: PreSignUpTriggerEvent | PostConfirmationTriggerEvent | PostAuthenticationTriggerEvent,
): Promise<any> => {
  if (event.triggerSource) {
    if (event.triggerSource.includes('PreSignUp_')) {
      return await preSignUpTrigger(event);
    } else if (event.triggerSource === 'PostAuthentication_Authentication') {
      return await postAuthenticationTrigger(event as PostAuthenticationTriggerEvent);
    }
    // else if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
    //   return await postConfirmationSignupTrigger(event);
    // }
  }

  return event;
};
