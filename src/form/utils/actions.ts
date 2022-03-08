import { sendEmail } from '../../utils/email';
import { User } from '../../user/utils/userModel';
import { FormModel } from './formModel';
import { ResponseModel } from './responseModel';
import { sendSms } from '../../utils/sms';
import { responsePopulate } from '../index';
import { getValue } from './variables';

export const runFormActions = async (response, form, pageId: any = null) => {
  if (form?.settings?.actions?.length > 0) {
    form?.settings?.actions?.forEach(async (action) => {
      if (
        action?.active &&
        action?.actionType === 'sendEmail' &&
        action?.senderEmail &&
        action?.subject &&
        action?.body &&
        (action?.receiverType === 'formOwner' ||
          (action?.receiverType === 'responseSubmitter' && response.createdBy?._id) ||
          (action?.receiverType === 'customEmail' && action?.receiverEmails?.length > 0) ||
          (action?.receiverType === 'emailField' && action?.emailFieldId))
      ) {
        const payload: any = {
          from: action?.senderEmail,
          body: action?.body,
          subject: action?.subject,
        };

        if (action?.variables?.length > 0) {
          const { subject, body } = await replaceVariables(
            payload?.subject,
            payload?.body,
            action?.variables,
            form?.fields,
            response?.values,
            pageId,
          );

          payload.subject = subject;
          payload.body = body;
        }

        if (action?.receiverType === 'formOwner') {
          const user = await User.findById(form?.createdBy?._id);
          if (user?.email) {
            payload.to = [user?.email];
          }
        } else if (action?.receiverType === 'responseSubmitter') {
          const user = await User.findById(response?.createdBy?._id);
          if (user?.email) {
            payload.to = [user?.email];
          }
        } else if (action?.receiverType === 'customEmail') {
          payload.to = action?.receiverEmails;
        } else if (action?.receiverType === 'emailField') {
          const emailField = response?.values?.filter(
            (value) => value.field === action?.emailFieldId,
          )[0];
          if (emailField) {
            payload.to = [emailField?.value];
          }
        }
        if (payload?.to?.length > 0) {
          await sendEmail(payload);
        }
      } else if (
        action?.active &&
        action?.actionType === 'sendSms' &&
        action?.phoneFieldId &&
        action?.body
      ) {
        const payload = {
          body: action?.body,
          phoneNumber: '',
        };
        if (action?.variables?.length > 0) {
          const { body } = await replaceVariables(
            '',
            payload.body,
            action?.variables,
            form?.fields,
            response?.values,
            pageId,
          );
          payload.body = body;
        }
        const phoneField = response?.values?.filter(
          (value) => value.field === action?.phoneFieldId,
        )[0];
        if (phoneField?.valueNumber) {
          payload.phoneNumber = `+${phoneField?.valueNumber}`;
        }
        await sendSms(payload);
      }
    });
  }
};

const replaceVariables = async (oldSubject, oldBody, oldVariables, fields, values, pageId) => {
  let subject = oldSubject;
  let body = oldBody;
  const formIds: any = [];
  const forms: any = [];

  oldVariables?.forEach((variable: any) => {
    if (variable.formId && !formIds.includes(variable.formId)) {
      formIds.push(variable.formId);
    }
  });

  for (const formId of formIds) {
    const form = await FormModel.findById(formId);
    const response = await ResponseModel.findOne({
      formId,
      parentId: { $elemMatch: { $eq: pageId } },
    })
      .sort({
        createdAt: -1,
      })
      .populate(responsePopulate);
    if (form && response) {
      forms.push({ ...form?.toObject(), response });
    }
  }

  const variables = oldVariables?.map((oneVariable) => {
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
    body = body.split(`{{${variable.name}}}`).join(variable.value || '');
    subject = subject.split(`{{${variable.name}}}`).join(variable.value || '');
  });
  return { subject, body };
};
