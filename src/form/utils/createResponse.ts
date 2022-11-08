import { ClientSession } from 'mongoose';
import { IResponse } from '../types/response';
import { ResponseModel } from './responseModel';

export const createResponse = async (response: Partial<IResponse>, session?: ClientSession) => {
  const payload = { ...response, count: 1 };
  let lastResponse;
  if (session) {
    lastResponse = await ResponseModel.findOne({ formId: payload.formId })
      .session(session)
      .sort('-count')
      .lean();
  } else {
    lastResponse = await ResponseModel.findOne({ formId: payload.formId }).sort('-count').lean();
  }
  if (lastResponse) {
    payload.count = lastResponse?.count + 1;
  }
  let newResponse;
  if (session) {
    const responsesArray = await ResponseModel.create([payload], {
      session: session,
    });
    newResponse = responsesArray?.[0];
  } else {
    newResponse = await ResponseModel.create(payload);
  }
  return newResponse;
};
