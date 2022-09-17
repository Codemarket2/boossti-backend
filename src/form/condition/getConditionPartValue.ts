import { ConditionPart, IForm } from '../types/form';
import { IResponse } from '../types/response';
import { ResponseModel } from '../utils/responseModel';
import { getValue } from '../utils/variables';

interface GetLeftPartValuePayload {
  conditionPart: ConditionPart;
  forms: { [key: string]: IForm };
  response?: IResponse;
  responseId?: string;
}

export const getLeftPartValue = async ({
  conditionPart,
  forms,
  response: tempResponse,
  responseId,
}: GetLeftPartValuePayload) => {
  let value;
  let response;
  if (tempResponse?._id) {
    response = tempResponse;
  } else if (responseId) {
    response = await ResponseModel.findOne({ _id: responseId });
  }

  if (conditionPart?.fieldId === 'createdBy') {
    value = response?.createdBy?._id?.toString();
  } else if (conditionPart?.fieldId === 'createdAt') {
    value = response?.createdAt;
  } else if (conditionPart?.fieldId === '_id') {
    value = response?._id?.toString();
  } else {
    const form = forms?.[conditionPart?.formId];
    const field = form?.fields?.find((f) => f?._id?.toString() === conditionPart?.fieldId);
    const fieldValue = response?.values?.find(
      (v) => v?.field?.toString() === conditionPart?.fieldId,
    );
    if (conditionPart?.subField?.fieldId) {
      value = await getLeftPartValue({
        forms,
        conditionPart: conditionPart?.subField,
        responseId: fieldValue?.response?._id,
      });
    } else {
      if (field?._id && fieldValue) {
        value = getValue(field, fieldValue);
      }
    }
  }
  return value;
};

export const getRightPartValue = ({ conditionPart, forms, responses, authState }) => {
  let rightValue;

  if (conditionPart?.value && conditionPart?.value?.includes('auth.')) {
    if (conditionPart?.value === 'auth._id') {
      rightValue = authState?._id;
    } else if (conditionPart?.value === 'auth.name') {
      rightValue = authState?.name;
    } else if (conditionPart?.value === 'auth.email') {
      rightValue = authState?.email;
    }
  } else if (conditionPart?.value === 'constantValue' && conditionPart?.constantValue) {
    rightValue = conditionPart?.constantValue;
  } else if (
    conditionPart?.value === 'form' &&
    conditionPart?.formId &&
    conditionPart?.fieldId &&
    conditionPart?.responseId
  ) {
    const form = forms?.[conditionPart?.formId];
    const response = responses?.[conditionPart?.responseId];
    if (conditionPart?.fieldId === 'createdBy') {
      rightValue = response?.createdBy?._id?.toString();
    } else if (conditionPart?.fieldId === 'createdAt') {
      rightValue = response?.createdAt;
    } else if (conditionPart?.fieldId === '_id') {
      rightValue = response?._id?.toString();
    } else {
      const field = form?.fields?.find(
        (f) => f?._id?.toString() === conditionPart?.fieldId?.toString(),
      );
      const fieldValue = response?.values?.find(
        (v) => v?.field?.toString() === conditionPart?.fieldId?.toString(),
      );
      if (field?._id && fieldValue) {
        rightValue = getValue(field, fieldValue);
      }
    }
  }

  return rightValue;
};
