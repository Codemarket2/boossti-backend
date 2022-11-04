import { IResponse } from '../types/response';
import { ResponseModel } from './responseModel';

export const createResponse = async (response: Partial<IResponse>) => {
  const payload = { ...response, count: 1 };
  const lastResponse = await ResponseModel.findOne({ formId: payload.formId })
    .sort('-count')
    .lean();
  if (lastResponse) {
    payload.count = lastResponse?.count + 1;
  }
  const newResponse = await ResponseModel.create(payload);
  return newResponse;
};
