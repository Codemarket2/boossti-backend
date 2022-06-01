import { sendEmail } from '../../utils/email';
import { User } from '../../user/utils/userModel';
import { FormModel } from './formModel';
import PageModel from '../../template/utils/pageModel';
import { ResponseModel } from './responseModel';
import { sendSms } from '../../utils/sms';
import { getFieldValue, replaceVariables, variableParser } from './actionHelper';
import { createDistribution } from '../../utils/cloudfront';
import { createCognitoGroup, deleteCognitoGroup, updateCognitoGroup } from './cognitoGroupHandler';
import {
  addUserToGroup,
  createUser,
  deleteUser,
  isUserAlreadyExist,
  removeUserFromGroup,
  updateUserAttributes,
} from '../../permissions/utils/cognitoHandlers';
import { ClientSession } from 'mongoose';

interface IPayload {
  triggerType: 'onCreate' | 'onUpdate' | 'onDelete' | 'onView';
  response: any;
  form: any;
  args?: any;
  session: ClientSession;
}

export const runFormActions = async ({ triggerType, response, form, args, session }: IPayload) => {
  const actions = form?.settings?.actions?.filter(
    (action) => action.active && action.triggerType === triggerType,
  );
  const pageId = response?.pageId?._id || response?.pageId || null;

  if (actions?.length > 0 && response?._id && form?._id && !(process.env.NODE_ENV === 'test')) {
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
          const { subject, body, senderEmail } = await replaceVariables({
            subject: payload?.subject,
            body: payload?.body,
            variables: action?.variables,
            fields: form?.fields,
            values: response?.values,
            pageId,
            senderEmail: payload.from,
            session,
          });

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
          const { body } = await replaceVariables({
            body: payload.body,
            variables: action?.variables,
            fields: form?.fields,
            values: response?.values,
            pageId,
            session,
          });
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
        const action = form.settings?.actions?.filter((a) => a.actionType === 'generateNewUser')[0];
        const email = getFieldValue(action?.emailFieldId, response.values)?.value;
        if (email) {
          const tempUser = await User.findOne({ email: email });
          if (tempUser) {
            await ResponseModel.findByIdAndUpdate(response._id, { createdBy: tempUser._id });
          }
        }
        const payload: any = {
          from: action?.senderEmail,
          body: variableParser(action, form, response),
          subject: action?.subject,
        };
        payload.body = payload.body.split(`{{password}}`).join(response.options?.password || '');
        if (action?.variables?.length > 0) {
          const { subject, body } = await replaceVariables({
            subject: payload?.subject,
            body: payload?.body,
            variables: action?.variables,
            fields: form?.fields,
            values: response?.values,
            pageId,
            session,
          });

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
          const { body: newBody } = await replaceVariables({
            body,
            variables: action?.variables,
            fields: form?.fields,
            values: response?.values,
            pageId,
            session,
          });
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
      } else if (
        action?.actionType === 'createSubDomainRoute53' &&
        action.domain &&
        action.distributionId
      ) {
        const domain = getFieldValue(action.domain, response.values);
        if (!domain?.value) {
          throw new Error('Account domain name not found');
        }
        const res = await createDistribution(domain.value);
        const distributionId = { value: res?.Distribution?.Id, field: action.distributionId };
        await ResponseModel.findByIdAndUpdate(
          response._id,
          { $push: { values: distributionId } },
          { session },
        );
      } else if (
        action?.actionType === 'updateSubDomainRoute53' &&
        action.domain &&
        action.distributionId
      ) {
        const domain = getFieldValue(action.domain, response.values);
        const distributionId = getFieldValue(action.distributionId, response.values);
        if (!domain?.value || !distributionId.value) {
          throw new Error('Account domain name, distributionId not found');
        }
        // update cloudfront distribution
      } else if (
        action?.actionType === 'deleteSubDomainRoute53' &&
        action.domain &&
        action.distributionId
      ) {
        const domain = getFieldValue(action.domain, response.values);
        const distributionId = getFieldValue(action.distributionId, response.values);
        if (!domain?.value || !distributionId.value) {
          throw new Error('Account domain name, distributionId not found');
        }
        // delete cloudfront distribution
      } else if (
        action?.actionType === 'createCognitoUser' &&
        action?.userPoolId &&
        // action?.firstName &&
        // action?.lastName &&
        action?.userEmail
      ) {
        const selectItemInForm = args?.values?.filter((e) => e?.response !== null)[0]?.response;
        const selectItemResponse = await ResponseModel.findById(selectItemInForm);
        const selectForm = await FormModel.findById(selectItemResponse?.formId);
        const selectItemField = selectForm?.fields
          ?.filter((e) => e?.fieldType === 'text' && e?.label?.toUpperCase().includes('ROLE'))
          .map((e) => e._id);
        const RoleName =
          selectItemResponse?.values
            ?.filter((e) => selectItemField?.includes(e.field))
            .map((e) => e.value) || [];

        const fName =
          getFieldValue(action?.firstName, response.values)?.value?.trim() || 'First Name';
        const lName =
          getFieldValue(action?.lastName, response.values)?.value?.trim() || 'Last Name';
        const uEmail = getFieldValue(action?.userEmail, response.values)?.value?.trim();

        const payload = {
          UserPoolId: action?.userPoolId,
          Username: uEmail,
          UserAttributes: [
            {
              Name: 'email',
              Value: uEmail,
            },
            {
              Name: 'email_verified',
              Value: 'True',
            },
            {
              Name: 'name',
              Value: `${fName} ${lName}`,
            },
            {
              Name: 'custom:_id',
              Value: response._id,
            },
          ],
        };
        const checkUser = await isUserAlreadyExist({
          Username: payload?.Username,
          UserPoolId: payload.UserPoolId,
        });
        if (!checkUser?.message && checkUser.error === null) {
          const createdUser = await createUser(payload);
          // create response in users form before creating new user
          // requirement: formid of users form
          // formId: ID!;
          // count: Int;
          // values: [ValueInput]; field, value
          // options: AWSJSON;
          // cretedBy : can be null
          if (form.slug !== 'users' && createdUser) {
            const usersForm = await FormModel.findOne({ slug: 'users' });
            const fNameField = usersForm?.fields?.find(
              (field) => field?.label === 'First Name',
            )?._id;
            const lNameField = usersForm?.fields?.find(
              (field) => field?.label === 'Last Name',
            )?._id;
            const emailField = usersForm?.fields?.find(
              (field) => field?.fieldType === 'email',
            )?._id;
            const lastResponse = await ResponseModel.findOne({ formId: usersForm?._id }).sort(
              '-count',
            );
            let responseCount;
            if (lastResponse) {
              responseCount = lastResponse?.count + 1;
            } else {
              responseCount = 1;
            }
            const cretatePayload = {
              formId: usersForm?._id,
              values: [
                {
                  field: fNameField, // for first name
                  value: fName,
                },
                {
                  field: lNameField, // for last name
                  value: lName,
                },
                {
                  field: emailField, // for email
                  value: uEmail,
                },
              ],
              count: responseCount,
            };

            await ResponseModel.create(cretatePayload);
          }
        }
        // add user to group
        for (let i = 0; i < RoleName?.length; i++) {
          const Cpayload = {
            GroupName: RoleName[i],
            UserPoolId: action?.userPoolId,
            Username: uEmail,
          };
          await addUserToGroup(Cpayload);
        }
      } else if (action?.actionType === 'createCognitoGroup') {
        const ResponseValue = args?.values
          ?.filter((e) => e.field === action?.cognitoGroupName)[0]
          ?.value.trim();
        const Desc = args?.values
          ?.filter((e) => e?.field === action?.cognitoGroupDesc)[0]
          ?.value.trim();
        const payload = {
          GroupName: ResponseValue,
          UserPoolId: action?.userPoolId,
          Description: Desc,
        };
        const highPriorityGroup = [
          'superadmin',
          'us-east-1_eBnsz43bl_Facebook',
          'us-east-1_eBnsz43bl_Google',
        ];
        if (!highPriorityGroup.includes(payload.GroupName)) await createCognitoGroup(payload);
        else
          return {
            message: 'you are not allowd for this action',
          };
      } else if (action?.actionType === 'deleteCognitoUser') {
        const selectItemInForm = response?.values?.filter((e) => e?.response !== null)[0]?.response;
        const selectItemResponse = await ResponseModel.findById(selectItemInForm);
        const selectForm = await FormModel.findById(selectItemResponse?.formId);
        const selectItemField = selectForm?.fields
          ?.filter((e) => e?.fieldType === 'text' && e?.label?.toUpperCase().includes('ROLE'))
          .map((e) => e._id);
        const RoleName =
          selectItemResponse?.values
            ?.filter((e) => selectItemField?.includes(e.field))
            .map((e) => e.value) || [];

        const uEmail = response?.values
          ?.filter((e) => e?.field === action?.userEmail)[0]
          ?.value.trim();

        const payload = {
          UserPoolId: action?.userPoolId,
          Username: uEmail,
        };
        try {
          for (let i = 0; i < RoleName?.length; i++) {
            const Dpayload = {
              GroupName: RoleName[i],
              UserPoolId: action?.userPoolId,
              Username: uEmail,
            };
            await removeUserFromGroup(Dpayload);
          }
          await deleteUser(payload);
        } catch (error) {
          return error.message;
        }
      } else if (action.actionType === 'deleteCognitoGroup') {
        const ResponseValue = response?.values
          ?.filter((e) => e.field === action?.cognitoGroupName)[0]
          ?.value.trim();
        const payload = {
          GroupName: ResponseValue,
          UserPoolId: action?.userPoolId,
        };
        const highPriorityGroup = [
          'superadmin',
          'us-east-1_eBnsz43bl_Facebook',
          'us-east-1_eBnsz43bl_Google',
        ];
        if (!highPriorityGroup.includes(payload.GroupName)) {
          await deleteCognitoGroup(payload);
        } else {
          throw new Error('you are not allowd for this action');
        }
      } else if (action.actionType === 'updateCognitoUser') {
        const fName = args?.values?.filter((e) => e?.field === action?.firstName)[0]?.value.trim();
        const lName = args?.values?.filter((e) => e?.field === action?.lastName)[0]?.value.trim();
        const uEmail = args?.values?.filter((e) => e?.field === action?.userEmail)[0]?.value.trim();

        const payload = {
          UserPoolId: action?.userPoolId,
          Username: uEmail,
          UserAttributes: [
            {
              Name: 'email',
              Value: uEmail,
            },
            {
              Name: 'email_verified',
              Value: 'True',
            },
            {
              Name: 'name',
              Value: `${fName} ${lName}`,
            },
          ],
        };

        await updateUserAttributes(payload);
      } else if (action.actionType === 'updateCognitoGroup') {
        const ResponseValue = args?.values
          ?.filter((e) => e.field === action?.cognitoGroupName)[0]
          ?.value.trim();
        const Desc = args?.values
          ?.filter((e) => e?.field === action?.cognitoGroupDesc)[0]
          ?.value.trim();
        const payload = {
          GroupName: ResponseValue,
          UserPoolId: action?.userPoolId,
          Description: Desc,
        };

        const highPriorityGroup = [
          'superadmin',
          'us-east-1_eBnsz43bl_Facebook',
          'us-east-1_eBnsz43bl_Google',
        ];
        if (!highPriorityGroup.includes(payload.GroupName)) await updateCognitoGroup(payload);
        else
          return {
            message: 'you are not allowd for this action',
          };
      }
    }
  }
};
