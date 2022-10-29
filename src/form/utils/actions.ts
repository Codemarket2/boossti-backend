// MONGOOSE
import { ClientSession } from 'mongoose';

// OTHERS
import { sendEmail } from '../../utils/email';
import { User } from '../../user/utils/userModel';
import { FormModel } from './formModel';
import PageModel from '../../template/utils/pageModel';
import { ResponseModel } from './responseModel';
import { sendSms } from '../../utils/sms';
import {
  getFieldValue,
  replaceSchemaVariables,
  getUserAttributes,
  generateUserPassword,
} from './actionHelper';
import { createDistribution } from '../../utils/cloudfront';
import { createCognitoGroup, deleteCognitoGroup, updateCognitoGroup } from './cognitoGroupHandler';
import {
  addUserToGroup,
  createAWSUser,
  deleteUser,
  isUserAlreadyExist,
  removeUserFromGroup,
  updateUserAttributes,
  getGroupListOfUser,
} from '../../permissions/utils/cognitoHandlers';
import axios from 'axios';
import { getActionVariableValues2, replaceVariableValue2 } from './actionVariables';
import { getLeftPartValue } from '../condition/getConditionPartValue';
import { getFormIds, getFormsByIds } from '../condition/getConditionForm';
import { resolveConditionHelper } from '../condition/resolveCondition';

interface IPayload {
  triggerType: 'onCreate' | 'onUpdate' | 'onDelete' | 'onView';
  response: any;
  form: any;
  args?: any;
  session: ClientSession;
  user: any;
}

export const runFormActions = async ({
  triggerType,
  response,
  form,
  args,
  session,
  user,
}: IPayload) => {
  const userForm = await FormModel.findOne({ slug: process.env.USERS_FORM_SLUG }).session(session);

  const actions = form?.settings?.actions?.filter(
    (action) => action.active && action.triggerType === triggerType,
  );

  /**  indicates if the action is ran by user having a boossti account */
  const isAppUser = Boolean(response?.createdBy?._id);

  if (actions?.length > 0 && response?._id && form?._id && !(process.env.NODE_ENV === 'test')) {
    for (const action of actions) {
      let triggerConditionResult = !(action?.triggerConditions?.length > 0);

      if (action?.triggerConditions?.length > 0) {
        // resolve condition
        try {
          triggerConditionResult = await resolveConditionHelper({
            responseId: response?._id,
            conditions: action?.triggerConditions,
            user: user,
          });
        } catch (error) {
          //
        }
      }
      if (triggerConditionResult) {
        // console.log('triggerConditionResult', triggerConditionResult);
        const variableValues = await getActionVariableValues2(action, response);
        // debugger;
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
            body: replaceSchemaVariables({ variable: action?.body, form, response, userForm }),
            subject: action?.subject,
          };

          if (action?.variables?.length > 0) {
            payload.subject = replaceVariableValue2({
              text: payload?.subject,
              variableValues,
            });
            payload.body = replaceVariableValue2({
              text: payload?.body,
              variableValues,
            });
            payload.senderEmail = replaceVariableValue2({
              text: payload?.senderEmail,
              variableValues,
            });
          }

          if (action?.receiverType === 'formOwner') {
            const user = getUserAttributes(userForm, form?.createdBy);
            if (user?.email) {
              payload.to = [user?.email];
            }
          } else if (action?.receiverType === 'responseSubmitter') {
            const user = getUserAttributes(userForm, response?.createdBy);
            if (!user.email) {
              throw new Error('Response submitter email not found in send email action');
            }
            payload.to = [user?.email];
          } else if (action?.receiverType === 'customEmail') {
            payload.to = action?.receiverEmails;
          } else if (action?.receiverType === 'emailField') {
            const formIds = getFormIds(action?.emailFieldId);
            const forms = await getFormsByIds(formIds);
            const emailFieldValue = await getLeftPartValue({
              response,
              forms,
              conditionPart: action?.emailFieldId,
            });
            if (emailFieldValue) {
              payload.to = [emailFieldValue];
            }
          }
          if (!(payload?.to?.length > 0)) {
            throw new Error('Receiver email not found in send email action');
          }
          await sendEmail(payload);
        } else if (
          action?.actionType === 'createWhatsappGroup' &&
          action?.phoneNumber &&
          action?.groupName &&
          action?.productid &&
          action?.phoneID &&
          action?.apiToken &&
          action?.whatsappMessage
        ) {
          try {
            let phoneNumber;
            let groupName = action?.groupName;
            const productid = action?.productid;
            const phoneID = action?.phoneID;
            const apiToken = action?.apiToken;
            const whatsappMessage = action?.whatsappMessage;
            if (variableValues) {
              groupName = replaceVariableValue2({
                text: groupName,
                variableValues,
              });
            }
            // debugger;
            response?.values?.forEach((value) => {
              if (value.field?.toString() === action?.phoneNumber?.toString()) {
                phoneNumber = value.valueNumber;
              }
            });
            if (phoneNumber.length === 10) {
              phoneNumber = '91' + phoneNumber.toString();
            } else {
              phoneNumber = phoneNumber.toString();
            }
            const numbersArray = ['919302449063', '18053007217', '919893549308'];
            numbersArray.push(phoneNumber.toString());
            const url = `https://api.maytapi.com/api/${productid}/${phoneID}/createGroup`;

            const data3 = await axios.post(
              url,
              {
                name: groupName,
                numbers: numbersArray,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'x-maytapi-key': apiToken,
                },
              },
            );
            if (data3?.data?.data?.id) {
              const url2 = `https://api.maytapi.com/api/${productid}/${phoneID}/sendMessage`;
              const data2 = await axios({
                method: 'post',
                url: url2,
                headers: {
                  'Content-Type': 'application/json',
                  'x-maytapi-key': apiToken,
                },
                data: {
                  to_number: data3?.data?.data?.id,
                  type: 'text',
                  message: whatsappMessage,
                },
              });
            }
          } catch (error) {
            console.log('error', error);
          }
        } else if (
          action?.actionType === 'linkedinInviteAutomation' &&
          action?.linkedinEmail &&
          action.linkedinPassword &&
          action.noOfInvites &&
          action.keyword &&
          action.tag
        ) {
          let email = '',
            password = '',
            numberOfInvites = 0,
            keyword = '',
            tag = '';
          response?.values?.forEach((value) => {
            if (value.field?.toString() === action?.linkedinEmail?.toString()) {
              email = value.value;
            } else if (value.field?.toString() === action?.linkedinPassword?.toString()) {
              password = value.value;
            } else if (value.field?.toString() === action?.noOfInvites?.toString()) {
              numberOfInvites = value.valueNumber;
            } else if (value.field?.toString() === action?.keyword?.toString()) {
              keyword = value.value;
            } else if (value.field?.toString() === action?.tag?.toString()) {
              tag = value.value;
            }
          });

          axios({
            method: 'post',
            url: 'https://e3iug2f6zh.execute-api.us-east-1.amazonaws.com/dev',
            headers: {},
            data: {
              email: email,
              password: password,
              numberOfInvites: numberOfInvites,
              keyword: keyword,
              tag: tag,
            },
          });
        } else if (action?.actionType === 'sendSms' && action?.phoneFieldId && action?.body) {
          const payload = {
            body: replaceSchemaVariables({ variable: action.body, form, response, userForm }),
            phoneNumber: '',
          };
          if (action?.variables?.length > 0) {
            payload.body = replaceVariableValue2({
              text: payload?.body,
              variableValues,
            });
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
          const action = form.settings?.actions?.filter(
            (a) => a.actionType === 'generateNewUser',
          )[0];
          const email = getFieldValue(action?.emailFieldId, response.values)?.value;
          if (email) {
            const tempUser = await User.findOne({ email: email });
            if (tempUser) {
              await ResponseModel.findByIdAndUpdate(response._id, { createdBy: tempUser._id });
            }
          }
          const payload: any = {
            from: action?.senderEmail,
            body: replaceSchemaVariables({ variable: action?.body, form, response, userForm }),
            subject: action?.subject,
          };
          payload.body = payload.body.split(`{{password}}`).join(response.options?.password || '');
          if (action?.variables?.length > 0) {
            payload.subject = replaceVariableValue2({
              text: payload?.subject,
              variableValues,
            });
            payload.body = replaceVariableValue2({
              text: payload?.body,
              variableValues,
            });
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
            const payload = { description: '', link: '', responseId: '' };
            const body = replaceSchemaVariables({
              variable: action?.body,
              form,
              response,
              userForm,
            });
            payload.description = replaceVariableValue2({
              text: body,
              variableValues,
            });
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
          const rolesField = form?.fields?.find(
            (e) => e.fieldType === 'select' && e.label.toUpperCase().includes('ROLE'),
          );
          const rolesFieldId = rolesField?._id.toString();
          const selectedFieldId = rolesField?.options?.formField;
          const updatedRolesID = args?.values
            ?.filter((e) => e.field === rolesFieldId)
            ?.map((e) => e.response);
          const RoleName: string[] = [];
          for (let i = 0; i < updatedRolesID.length; i++) {
            const tempResponse = await ResponseModel.findById(updatedRolesID[i]).lean();
            const value = tempResponse?.values?.find((e) => e.field === selectedFieldId)?.value;
            value && RoleName.push(value);
          }

          const fName = (getFieldValue(action?.firstName, response.values)?.value?.trim() ||
            'First Name') as string;
          const lName = (getFieldValue(action?.lastName, response.values)?.value?.trim() ||
            'Last Name') as string;
          const uEmail = getFieldValue(action?.userEmail, response.values)?.value?.trim() as string;

          const checkUser = await isUserAlreadyExist({
            Username: uEmail,
            UserPoolId: action?.userPoolId,
          });

          const TemporaryPassword = generateUserPassword();

          // USER DOES NOT EXISTS, SO CREATE THE USER
          if (!checkUser?.message && checkUser.error === null) {
            const payload: Parameters<typeof createAWSUser>[0] = {
              UserPoolId: action?.userPoolId,
              Username: uEmail,
              MessageAction: 'SUPPRESS',
              UserAttributes: [
                {
                  Name: 'email',
                  Value: uEmail,
                },
                {
                  Name: 'email_verified',
                  Value: 'False',
                },
                {
                  Name: 'name',
                  Value: `${fName} ${lName}`,
                },
                {
                  Name: 'custom:_id',
                  Value: `${response._id}`,
                },
              ],
              email: uEmail,
              TemporaryPassword: TemporaryPassword,
            };

            const createdUser = await createAWSUser(payload);
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

            const TemporaryPasswordMessage = `\nUsername : <b>${uEmail}</b><br/>temporary password : <b>${TemporaryPassword}</b>`;

            const subject = replaceVariableValue2({
              text: action?.signupEmailSubject,
              variableValues,
            });
            const body = replaceVariableValue2({
              text: action?.signupEmailBody,
              variableValues,
            });

            // SEND SIGNUP EMAIL TO THE USER
            await sendEmail({
              from: action?.templateSenderEmail,
              to: [uEmail],
              subject: subject,
              body: body + TemporaryPasswordMessage,
            });
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
          const selectItemInForm = response?.values?.filter((e) => e?.response !== null)[0]
            ?.response;
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
        } else if (
          action.actionType === 'updateCognitoUser' &&
          action?.userPoolId &&
          action?.userEmail
        ) {
          const fName = args?.values
            ?.filter((e) => e?.field === action?.firstName)[0]
            ?.value.trim();
          const lName = args?.values?.filter((e) => e?.field === action?.lastName)[0]?.value.trim();
          const uEmail = args?.values
            ?.filter((e) => e?.field === action?.userEmail)[0]
            ?.value.trim();
          const rolesField = form?.fields?.find(
            (e) => e.fieldType === 'select' && e.label.toUpperCase().includes('ROLE'),
          );
          const rolesFieldId = rolesField?._id.toString();
          const selectedFieldId = rolesField?.options?.formField;
          const updatedRolesID = args?.values
            ?.filter((e) => e.field === rolesFieldId)
            ?.map((e) => e.response);
          const selectedResponse: string[] = [];
          for (let i = 0; i < updatedRolesID.length; i++) {
            const tempResponse = await ResponseModel.findById(updatedRolesID[i]).lean();
            const value = tempResponse?.values?.find((e) => e.field === selectedFieldId)?.value;
            value && selectedResponse.push(value);
          }
          const cognitoGroupList =
            (
              await getGroupListOfUser({
                UserPoolId: action?.userPoolId,
                Username: uEmail,
              })
            )?.Groups || [];

          const cognitoGroupListName: string[] = cognitoGroupList?.map((e) => e.GroupName || '');

          for (let i = 0; i < selectedResponse.length; i++) {
            if (!cognitoGroupListName?.includes(selectedResponse[i])) {
              const Cpayload = {
                GroupName: selectedResponse[i],
                UserPoolId: action?.userPoolId,
                Username: uEmail,
              };
              await addUserToGroup(Cpayload);
            }
          }
          for (let i = 0; i < cognitoGroupListName?.length; i++) {
            if (
              cognitoGroupListName[i] !== '' &&
              !selectedResponse?.includes(cognitoGroupListName[i])
            ) {
              const Dpayload = {
                GroupName: cognitoGroupListName[i],
                UserPoolId: action?.userPoolId,
                Username: uEmail,
              };
              await removeUserFromGroup(Dpayload);
            }
          }
          const payload = {
            UserPoolId: action?.userPoolId,
            Username: uEmail,
            UserAttributes: [
              {
                Name: 'email',
                Value: uEmail,
              },
              // AUTO VERIFY THE EMAIL | THIS WILL BE REMOVED IN THE FUTURE
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
  }
};
