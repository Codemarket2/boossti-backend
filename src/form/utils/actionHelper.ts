import moment from 'moment';
import { ClientSession } from 'mongoose';
import { FormModel } from './formModel';
import { ResponseModel, responsePopulate } from './responseModel';
import { getValue } from './variables';

export const getFieldValue = (fieldId, values) => {
  return values.find((v) => v?.field === fieldId);
};
export const getFieldValueByLabel = (label, fields, values) => {
  const fieldId = fields.find((f) => f?.label?.toLowerCase() === label?.toLowerCase())?._id;
  return values.find((v) => v?.field === fieldId);
};

export const variableParser = (action: any, form: any, response: any) => {
  let body = action?.body;
  body = body.split('{{formName}}').join(`${form?.name}`);
  body = body.split('{{createdBy}}').join(`${response?.createdBy?.name || ''}`);
  body = body.split('{{updatedBy}}').join(`${response?.updatedBy?.name || ''}`);
  body = body.split('{{createdAt}}').join(`${moment(response?.createdAt).format('llll')}`);
  body = body.split('{{updatedAt}}').join(`${moment(response?.updatedAt).format('llll')}`);
  body = body.split('{{pageName}}').join(`${response?.parentId?.title || ''}`);
  return body;
};

interface IReplaceVariablePayload {
  subject?: string;
  body?: string;
  variables: any[];
  fields: any[];
  values: any[];
  pageId: string;
  senderEmail?: string;
  templateId?: string;
  session: ClientSession;
}

export const replaceVariables = async ({
  subject = '',
  body = '',
  variables,
  fields,
  values,
  pageId,
  senderEmail = '',
  templateId,
  session,
}: IReplaceVariablePayload) => {
  const formIds: any = [];
  const forms: any = [];

  variables?.forEach((variable: any) => {
    if (variable.formId && !formIds.includes(variable.formId)) {
      formIds.push(variable.formId);
    }
  });

  for (const formId of formIds) {
    const form = await FormModel.findById(formId).session(session);
    const response = await ResponseModel.findOne({
      formId,
      parentId: pageId,
      templateId,
    })
      .sort('-createdAt')
      .populate(responsePopulate)
      .session(session);
    if (form && response) {
      forms.push({ ...form?.toObject(), response });
    }
  }
  variables = variables?.map((oneVariable) => {
    const variable = { ...oneVariable, value: '' };
    let field = null;
    let value = null;
    field = fields.find((f) => f._id?.toString() === variable?.field);
    value = values.find((v) => v.field === variable?.field);

    if (variable.formId) {
      const form = forms.find((f) => f._id?.toString() === variable.formId);
      if (form) {
        field = form?.fields?.find((f) => f._id?.toString() === variable?.field);
        value = form?.response?.values?.find((v) => v.field === variable?.field);
      }
    }
    if (field && value) {
      variable.value = getValue(field, value);
    }
    return variable;
  });
  variables.forEach((variable) => {
    const variableName = `{{${variable.name}}}`;
    const variableValue = variable.value || '';
    if (body) {
      body = body.split(variableName).join(variableValue);
    }
    if (subject) {
      subject = subject.split(variableName).join(variableValue);
    }
    if (senderEmail) {
      senderEmail = senderEmail.split(variableName).join(variableValue);
    }
  });
  return { subject, body, senderEmail };
};
