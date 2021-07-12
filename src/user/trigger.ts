import {
  PreSignUpTriggerEvent,
  PostAuthenticationTriggerEvent,
} from 'aws-lambda';
import {
  preSignUpTrigger,
  postAuthenticationTrigger,
} from './utils/cognitoTriggers';
import { DB } from '../utils/DB';

export const handler = async (
  event: PreSignUpTriggerEvent | PostAuthenticationTriggerEvent
): Promise<any> => {
  await DB();
  if (event.triggerSource && event.triggerSource.includes('PreSignUp_')) {
    return await preSignUpTrigger(event);
  }
  if (
    event.triggerSource &&
    event.triggerSource === 'PostAuthentication_Authentication'
  ) {
    return await postAuthenticationTrigger(event);
  }
};
