import { sendEmail } from '../../utils/email';
import { User } from '../../user/utils/userModel';
import { sendSms } from '../../utils/sms';

export const runFormActions = async (response, form, actions?: any) => {
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
          const variables = getVariables(action?.variables, response);
          variables.forEach((variable) => {
            payload.subject = payload.subject
              .split(`{{${variable.name}}}`)
              .join(variable.value || '');
            payload.body = payload.body.split(`{{${variable.name}}}`).join(variable.value || '');
          });
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
          const variables = getVariables(action?.variables, response);
          variables.forEach((variable) => {
            payload.body = payload.body.split(`{{${variable.name}}}`).join(variable.value || '');
          });
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

const getVariables = (variables, response) => {
  return variables?.map((v) => {
    v = { ...v, value: '' };
    const variableValue = response?.values?.filter((value) => value.field === v?.field)[0];
    if (variableValue) {
      v.value =
        variableValue.value ||
        variableValue.valueNumber ||
        variableValue.valueBoolean ||
        variableValue.valueDate;
    }
    return v;
  });
};
