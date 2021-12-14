import { DB } from '../utils/DB';
import { FormModel } from './utils/formModel';
import { ResponseModel } from './utils/responseModel';
import ListType from '../list/utils/listTypeModel';
import ListItem from '../list/utils/listItemModel';
import { getCurretnUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';
import { userPopulate } from '../utils/populate';
import { sendEmail } from '../utils/email';

const formPopulate = [
  userPopulate,
  {
    path: 'fields.typeId',
    select: 'title description media slug',
  },
];

const itemSelect = 'types title media slug';

const responsePopulate = [
  userPopulate,
  {
    path: 'parentId',
    select: itemSelect,
  },
  {
    path: 'values.itemId',
    select: itemSelect,
  },
];

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const {
      info: { fieldName },
      identity,
    } = event;
    const user = await getCurretnUser(identity);
    let args = { ...event.arguments };

    if (fieldName.toLocaleLowerCase().includes('create') && user && user._id) {
      args = { ...args, createdBy: user._id };
    } else if (fieldName.toLocaleLowerCase().includes('update') && user && user._id) {
      args = { ...args, updatedBy: user._id };
    }

    switch (fieldName) {
      case 'getForm': {
        return await FormModel.findById(args._id).populate(formPopulate);
      }
      case 'getForms': {
        const { page = 1, limit = 20, search = '' } = args;
        const data = await FormModel.find({ name: { $regex: search, $options: 'i' } })
          .populate(formPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await FormModel.countDocuments({ name: { $regex: search, $options: 'i' } });
        return {
          data,
          count,
        };
      }
      case 'createForm': {
        const form = await FormModel.create(args);
        return await form.populate(formPopulate).execPopulate();
      }
      case 'updateForm': {
        const form: any = await FormModel.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        return await form.populate(formPopulate).execPopulate();
      }
      case 'deleteForm': {
        await FormModel.findByIdAndDelete(args._id);
        return args._id;
      }
      case 'getResponse': {
        return await ResponseModel.findById(args._id).populate(responsePopulate);
      }
      case 'getResponses': {
        const { page = 1, limit = 20, formId } = args;
        const data = await ResponseModel.find({ formId })
          .populate(responsePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ResponseModel.countDocuments({ formId });
        return {
          data,
          count,
        };
      }
      case 'createResponse': {
        let response = await ResponseModel.create(args);
        response = await response.populate(responsePopulate).execPopulate();
        // Run Actions
        const form = await FormModel.findById(response.formId);
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
                  const variableValue = response?.values?.filter(
                    (value) => value.field === v?.field,
                  )[0];
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
                  payload.body = payload.body
                    .split(`{{${variable.name}}}`)
                    .join(variable.value || '');
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
        return response;
      }
      case 'updateResponse': {
        const form: any = await ResponseModel.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        return await form.populate(responsePopulate).execPopulate();
      }
      case 'deleteResponse': {
        await ResponseModel.findByIdAndDelete(args._id);
        return args._id;
      }
      case 'getMyResponses': {
        const { page = 1, limit = 20 } = args;
        const data = await ResponseModel.find({ createdBy: user._id })
          .populate(responsePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ResponseModel.countDocuments({ createdBy: user._id });
        return {
          data,
          count,
        };
      }
      default:
        throw new Error('Something went wrong! Please check your Query or Mutation');
    }
  } catch (error) {
    if (error.runThis) {
      await ListType.findOne();
      await ListItem.findOne();
    }
    const error2 = error;
    throw error2;
  }
};
