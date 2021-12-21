import { sendEmail } from '../../utils/email';

export const runFormActions = async (response, form) => {
  if (form && form?.settings?.actions && form?.settings?.actions?.length > 0) {
    form?.settings?.actions?.forEach(async (action) => {
      if (
        action?.active &&
        action?.actionType === 'sendEmail' &&
        action?.senderEmail &&
        action?.subject &&
        action?.body &&
        (action?.receiverEmail || (action?.useEmailField && action?.emailFieldId))
      ) {
        const payload: any = {
          from: action?.senderEmail,
          body: action?.body,
          subject: action?.subject,
        };

        if (action?.variables && action?.variables?.length > 0) {
          const variables = action?.variables?.map((v) => {
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
          variables.forEach((variable) => {
            payload.subject = payload.subject
              .split(`{{${variable.name}}}`)
              .join(variable.value || '');
            payload.body = payload.body.split(`{{${variable.name}}}`).join(variable.value || '');
          });
        }

        if (action?.useEmailField && action?.emailFieldId) {
          const emailField = response?.values?.filter(
            (value) => value.field === action?.emailFieldId,
          )[0];
          if (emailField) {
            payload.to = [emailField?.value];
            await sendEmail(payload);
          }
        } else {
          payload.to = [action?.receiverEmail];
          await sendEmail(payload);
        }
      }
    });
  }
};
