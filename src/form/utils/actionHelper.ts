import moment from 'moment';
import { ClientSession } from 'mongoose';
import { systemForms } from '../permission/systemFormsConfig';
import { FormModel } from './formModel';
import { ResponseModel, responsePopulate } from './responseModel';
import { getValue } from './variables';

export const getFieldValue = (fieldId, values) => {
  return values.find((v) => v?.field === fieldId);
};

export const getFieldValueByLabel = (label, fields, values) => {
  const fieldId = fields?.find((f) => f?.label?.toLowerCase() === label?.toLowerCase())?._id;
  const value = values?.find((v) => v?.field?.toString() === fieldId?.toString());
  return value;
};

interface IReplaceSchemaVariablesPayload {
  variable: string;
  form: any;
  response: any;
  userForm: any;
}

export const replaceSchemaVariables = ({
  variable,
  form,
  response,
  userForm,
}: IReplaceSchemaVariablesPayload) => {
  variable = variable.split('{{formName}}').join(`${form?.name}`);
  if (variable?.includes('{{createdBy}}')) {
    const user = getUserAttributes(userForm, response?.createdBy);
    let createdBy = user?.firstName;
    if (createdBy && user?.lastName) {
      createdBy += ` ${user?.lastName}`;
    }
    variable = variable.split('{{createdBy}}').join(createdBy || '');
  }
  // variable = variable.split('{{updatedBy}}').join(`${response?.updatedBy?.name || ''}`);
  variable = variable.split('{{createdAt}}').join(`${moment(response?.createdAt).format('llll')}`);
  variable = variable.split('{{updatedAt}}').join(`${moment(response?.updatedAt).format('llll')}`);
  variable = variable.split('{{pageName}}').join(`${response?.parentId?.title || ''}`);
  return variable;
};

export interface IUserAttributes {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  name: string;
}
export const getUserAttributes = (userForm: any, userResponse): IUserAttributes => {
  const firstName = getFieldValueByLabel(
    systemForms.users.fields.firstName,
    userForm?.fields,
    userResponse?.values,
  )?.value;
  const lastName = getFieldValueByLabel(
    systemForms.users.fields.lastName,
    userForm?.fields,
    userResponse?.values,
  )?.value;
  const email = getFieldValueByLabel(
    systemForms.users.fields.email,
    userForm?.fields,
    userResponse?.values,
  )?.value;
  let name = `${firstName}`;
  if (lastName) {
    name += ` ${lastName}`;
  }
  return { _id: userResponse?._id?.toString(), firstName, lastName, email, name };
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
  form: any;
  response: any;
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
  form,
  response,
}: IReplaceVariablePayload) => {
  const formIds: any = [];
  const forms: any = [];

  variables?.forEach((variable: any) => {
    if (variable.formId && !formIds.includes(variable.formId)) {
      formIds.push(variable.formId);
    }
  });

  for (const formId of formIds) {
    if (formId?.toString() === form?._id?.toString()) {
      forms.push({ ...form, response });
    } else {
      const tempForm = await FormModel.findById(formId).session(session);
      const tempResponse = await ResponseModel.findOne({
        formId,
        parentId: pageId,
        templateId,
      })
        .sort('-createdAt')
        .populate(responsePopulate)
        .session(session);
      if (tempForm && tempResponse) {
        forms.push({ ...tempForm?.toObject(), response: tempResponse });
      }
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
