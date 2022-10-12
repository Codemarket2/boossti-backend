import { ConditionPart, ICondition, IForm } from '../types/form';
import { IResponse } from '../types/response';
import { FormModel, formPopulate } from '../utils/formModel';
import { ResponseModel, responsePopulate } from '../utils/responseModel';

export const getConditionFormsAndResponses = async (conditions: ICondition[]) => {
  let formIds: string[] = [];
  let responseIds: string[] = [];
  conditions?.forEach((condition) => {
    const leftFormIds = getFormIds(condition?.left);
    const rightFormIds = getFormIds(condition?.right);
    formIds = [...formIds, ...leftFormIds, ...rightFormIds];
    const leftResponseIds = getResponseIds(condition?.right);
    responseIds = [...responseIds, ...leftResponseIds];
  });

  formIds = [...new Set(formIds)];
  responseIds = [...new Set(responseIds)];

  const forms = await getFormsByIds(formIds);

  const responses: { [key: string]: IResponse } = {};
  const responsesArray = await ResponseModel.find({ _id: { $in: responseIds } })
    .populate(responsePopulate)
    .lean();

  responseIds.forEach((responseId) => {
    const response = responsesArray?.find(
      (selectedResponse) => selectedResponse?._id?.toString() === responseId,
    );
    if (response?._id) {
      responses[responseId] = response;
    }
  });

  return { forms, responses };
};

export const getFormIds = (part: ConditionPart) => {
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

export const getFormsByIds = async (formIds) => {
  const forms: { [key: string]: IForm } = {};
  const formsArray = await FormModel.find({ _id: { $in: formIds } })
    .populate(formPopulate)
    .lean();

  formIds.forEach((formId) => {
    const form = formsArray?.find((selectedForm) => selectedForm?._id?.toString() === formId);
    if (form?._id) {
      forms[formId] = form;
    }
  });
  return forms;
};
