/* eslint-disable no-prototype-builtins */
import { PostAuthenticationTriggerEvent } from 'aws-lambda';
import { updateEmailVerified } from './helper';

export const postAuthenticationTrigger = async (event: PostAuthenticationTriggerEvent) => {
  const { userAttributes } = event.request;
  console.log('Post Authentication SignIn Triggered');
  // if (!event.request.userAttributes.hasOwnProperty('custom:_id')) {
  //   await DB();
  //   const userId = event.userName;
  //   const tempUser: any = await User.findOne({
  //     userId: userId,
  //   });
  //   await adminUpdateUserAttribute(userId, {
  //     Name: 'custom:_id',
  //     Value: `${tempUser._id}`,
  //   });
  // }

  // if the email is verified then also make emailVerified = true property of User in the Database
  await updateEmailVerified(event);

  return event;
};
