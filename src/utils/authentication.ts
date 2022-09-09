// import * as mongoose from 'mongoose';
import { FormModel } from '../form/utils/formModel';
import { ResponseModel, responsePopulate } from '../form/utils/responseModel';
import { IResponse } from '../form/utils/responseType';
import { IIdentity } from './customTypes';

export const getCurrentUser = async (identity: IIdentity): Promise<IResponse> => {
  let user;
  if (identity?.claims?.['custom:_id']) {
    user = await ResponseModel.findOne({
      _id: identity?.claims?.['custom:_id'],
    })
      .populate(responsePopulate)
      .lean();
  } else if (identity?.claims?.email) {
    const userForm = await FormModel.findOne({ slug: process.env.USERS_FORM_SLUG });
    if (!userForm?._id) {
      throw new Error('Users form not found in database');
    }
    const emailFieldId = userForm?.fields?.find((f) => f.label?.toLowerCase() === 'email')?._id;
    user = await ResponseModel.findOne({
      formId: userForm?._id,
      values: { $elemMatch: { value: identity.claims.email, field: emailFieldId } },
    })
      .populate(responsePopulate)
      .lean();
  }
  return user;
};
