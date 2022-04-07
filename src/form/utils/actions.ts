import { sendEmail } from '../../utils/email';
import { User } from '../../user/utils/userModel';
import { FormModel } from './formModel';
import PageModel from '../../template/utils/pageModel';
import { ResponseModel } from './responseModel';
import { sendSms } from '../../utils/sms';
import { responsePopulate } from './responseModel';
import { getValue } from './variables';
import moment from 'moment';

export const runFormActions = async (response, form, pageId: any = null) => {
  if (form?.settings?.actions?.length > 0) {
    const actions = form?.settings?.actions?.filter((a) => a.active);
    for (const action of actions) {
      if (
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
          body: variableParser(action, form, response),
          subject: action?.subject,
        };

        if (action?.variables?.length > 0) {
          const { subject, body, senderEmail } = await replaceVariables(
            payload?.subject,
            payload?.body,
            action?.variables,
            form?.fields,
            response?.values,
            pageId,
            payload.from,
          );

          payload.subject = subject;
          payload.body = body;
          payload.from = senderEmail;
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
      } else if (action?.actionType === 'sendSms' && action?.phoneFieldId && action?.body) {
        const payload = {
          body: variableParser(action, form, response),
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
      } else if (
        action?.actionType === 'generateNewUser' &&
        action?.senderEmail &&
        action?.subject &&
        action?.body &&
        action?.receiverType === 'emailField' &&
        action?.emailFieldId
      ) {
        const payload: any = {
          from: action?.senderEmail,
          body: variableParser(action, form, response),
          subject: action?.subject,
        };
        payload.body = payload.body.split(`{{password}}`).join(response.options.password || '');
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

        const emailField = response?.values?.filter(
          (value) => value.field === action?.emailFieldId,
        )[0];
        if (emailField) {
          payload.to = [emailField?.value];
        }
        if (payload?.to?.length > 0) {
          if (response.options.generateNewUserEmail) {
            await sendEmail(payload);
          }
        }
      } else if (
        action?.actionType === 'sendInAppNotification' &&
        (action?.receiverType === 'formOwner' ||
          (action?.receiverType === 'responseSubmitter' && response?.createdBy?._id)) &&
        action?.body
      ) {
        const notificationForm = await FormModel.findOne({ slug: 'notification' });
        const feedPage = await PageModel.findOne({ slug: 'my' });

        if (notificationForm && feedPage) {
          const body = variableParser(action, form, response);
          const { body: newBody } = await replaceVariables(
            '',
            body,
            action?.variables,
            form?.fields,
            response?.values,
            pageId,
          );
          const payload = { description: '', link: '', responseId: '' };
          payload.description = newBody;
          payload.link = `/forms/${form.slug}/response/${response.count}`;
          payload.responseId = response._id;
          const responsePayload: any = {
            formId: notificationForm._id,
            values: [],
            count: 1,
            createdBy: null,
            parentId: feedPage._id,
          };

          notificationForm?.fields?.forEach((field) => {
            if (field.label.toLocaleLowerCase() === 'description') {
              responsePayload.values.push({
                field: field._id,
                value: payload.description,
              });
            }
            if (field.label.toLocaleLowerCase() === 'response id') {
              responsePayload.values.push({
                field: field._id,
                value: payload.responseId,
              });
            }
            if (field.label.toLocaleLowerCase() === 'link') {
              responsePayload.values.push({
                field: field._id,
                value: payload.link,
              });
            }
          });

          if (action.receiverType === 'formOwner') {
            responsePayload.createdBy = form.createdBy._id;
          } else if (action.receiverType === 'responseSubmitter') {
            responsePayload.createdBy = response.createdBy._id;
          }
          const lastResponse = await ResponseModel.findOne({
            formId: responsePayload.formId,
          }).sort('-count');
          if (lastResponse) {
            responsePayload.count = lastResponse?.count + 1;
          }
          await ResponseModel.create(responsePayload);
        }
      }
    }
  }
};

//  variable parser function

const variableParser = (action: any, form: any, response: any) => {
  let body = action?.body;
  body = body.split('{{formName}}').join(`${form?.name}`);
  body = body.split('{{createdBy}}').join(`${response?.createdBy?.name || ''}`);
  body = body.split('{{updatedBy}}').join(`${response?.updatedBy?.name || ''}`);
  body = body.split('{{createdAt}}').join(`${moment(response?.createdAt).format('llll')}`);
  body = body.split('{{updatedAt}}').join(`${moment(response?.updatedAt).format('llll')}`);
  body = body.split('{{pageName}}').join(`${response?.parentId?.title || ''}`);
  return body;
};

const replaceVariables = async (
  oldSubject,
  oldBody,
  oldVariables,
  fields,
  values,
  pageId,
  oldSenderEmail = '',
) => {
  let subject = oldSubject;
  let senderEmail = oldSenderEmail;
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
      parentId: pageId,
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
    senderEmail = senderEmail.split(`{{${variable.name}}}`).join(variable.value || '');
  });
  return { subject, body, senderEmail };
};
