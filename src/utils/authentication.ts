// import * as mongoose from 'mongoose';
import { FormModel } from '../form/utils/formModel';
import { ResponseModel } from '../form/utils/responseModel';
import { IIdentity } from './cutomTypes';

export const getCurrentUser = async (identity: IIdentity) => {
  let user;
  if (identity && identity.claims && identity.claims.sub && identity.claims['custom:_id']) {
    user = {
      _id: identity.claims['custom:_id'],
      name: identity.claims.name,
      picture: identity.claims.picture,
    };
  } else if (identity && identity.claims && identity.claims.sub) {
    const userForm = await FormModel.findOne({ slug: process.env.USERS_FORM_SLUG });
    if (!userForm?._id) {
      throw new Error('Users form not found in database');
    }
    const emailFieldId = userForm?.fields?.find((f) => f.label?.toLowerCase() === 'email')?._id;
    user = await ResponseModel.findOne({
      formId: userForm?._id,
      values: { $elemMatch: { value: identity.claims.email, field: emailFieldId } },
    });
  }
  return user;
};
