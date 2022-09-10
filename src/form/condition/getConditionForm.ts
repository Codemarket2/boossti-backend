import { ConditionPart, ICondition, IForm } from '../types/form';
import { IResponse } from '../types/response';
import { FormModel, formPopulate } from '../utils/formModel';
import { ResponseModel, responsePopulate } from '../utils/responseModel';

export const getConditionFormsAndResponses = async (conditions: ICondition[]) => {
  const formIds: string[] = [];
  const responseIds: string[] = [];
  conditions?.forEach((condition) => {
    const leftFormIds = getFormIds(condition?.left);
    const rightFormIds = getFormIds(condition?.right);
    const rightResponseIds = getResponseIds(condition?.right);
    [...leftFormIds, ...rightFormIds].forEach((formId) => {
      if (formId && !formIds?.includes(formId)) {
        formIds.push(formId);
      }
    });
    rightResponseIds.forEach((responseId) => {
      if (responseId && !responseIds?.includes(responseId)) {
        responseIds.push(responseId);
      }
    });
  });
  const forms: { [key: string]: IForm } = {};
  for (const formId of formIds) {
    if (!forms[formId]?._id) {
      const form = await FormModel.findOne({ _id: formId }).populate(formPopulate).lean();
      if (form?._id) {
        forms[form?._id] = form;
      }
    }
  }
  const responses: { [key: string]: IResponse } = {};
  for (const responseId of responseIds) {
    if (!responses[responseId]?._id) {
      const response = await ResponseModel.findOne({ _id: responseId })
        .populate(responsePopulate)
        .lean();
      if (response?._id) {
        responses[response?._id] = response;
      }
    }
  }
  return { forms, responses };
};

const getFormIds = (part: ConditionPart) => {
  let formIds: string[] = [];
  if (part?.formId) {
    formIds.push(part?.formId);
  }
  if (part?.subField?.formId) {
    const nestedFormIds = getFormIds(part?.subField);
    if (nestedFormIds?.length > 0) {
      formIds = [...formIds, ...nestedFormIds];
    }
  }
  return formIds;
};

const getResponseIds = (part: ConditionPart) => {
  let responseIds: string[] = [];
  if (part?.responseId) {
    responseIds.push(part?.responseId);
  }
  if (part?.subField?.responseId) {
    const nestedFormIds = getResponseIds(part?.subField);
    if (nestedFormIds?.length > 0) {
      responseIds = [...responseIds, ...nestedFormIds];
    }
  }
  return responseIds;
};
