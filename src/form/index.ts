import slugify from 'slugify';
import { DB } from '../utils/DB';
import { FormModel, formPopulate } from './utils/formModel';
import { ResponseModel, responsePopulate, myResponsePopulate } from './utils/responseModel';
import { SectionModel, sectionPopulate } from './utils/sectionModel';
import Template from '../template/utils/templateModel';
import Page from '../template/utils/pageModel';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';
import { runFormActions } from './utils/actions';
import { sendResponseNotification } from './utils/responseNotification';
import getAdminFilter from '../utils/adminFilter';
import { fileParser } from './utils/readCsvFile';
import { User } from '../user/utils/userModel';
import {
  createCognitoGroup,
  deleteCognitoGroup,
  updateCognitoGroup,
} from './utils/cognitoGroupHandler';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const {
      info: { fieldName },
      identity,
    } = event;
    const user = await getCurrentUser(identity);
    let args = { ...event.arguments };
    if (Object.prototype.hasOwnProperty.call(args, 'name')) {
      args = { ...args, slug: slugify(args.name, { lower: true }) };
    }
    if (fieldName.toLocaleLowerCase().includes('create') && user && user._id) {
      args = { ...args, createdBy: user._id };
    } else if (fieldName.toLocaleLowerCase().includes('update') && user && user._id) {
      args = { ...args, updatedBy: user._id };
    }

    switch (fieldName) {
      case 'getForm': {
        return await FormModel.findById(args._id).populate(formPopulate);
      }
      case 'getFormBySlug': {
        return await FormModel.findOne({ slug: args.slug }).populate(formPopulate);
      }
      case 'getForms': {
        const { page = 1, limit = 20, search = '' } = args;
        const adminFilter = getAdminFilter(identity, user);
        const data = await FormModel.find({
          ...adminFilter,
          name: { $regex: search, $options: 'i' },
        })
          .populate(formPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await FormModel.countDocuments({
          ...adminFilter,
          name: { $regex: search, $options: 'i' },
        });
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
        await ResponseModel.deleteMany({ formId: args._id });
        await SectionModel.findByIdAndDelete(args._id);
        return args._id;
      }
      case 'getResponse': {
        return await ResponseModel.findById(args._id).populate(responsePopulate);
      }
      case 'getResponseByCount': {
        const response: any = await ResponseModel.findOne(args).populate(responsePopulate);
        const oldOptions = { ...args.options };
        if (!(process.env.NODE_ENV === 'test')) {
          const res: any = await FormModel.findById(response?.formId).populate(formPopulate);
          const form = { ...res.toObject() };
          const act = form?.settings?.actions?.filter((e) => e.triggerType === 'onView');
          if (form && act) {
            await runFormActions(
              { ...response.toObject(), options: oldOptions },
              {
                ...form,
                settings: {
                  ...form.settings,
                  actions: args?.options?.actions || form.settings?.actions,
                },
              },
              args?.parentId,
            );
            await sendResponseNotification(form, response);
          }
        }
        return response;
      }
      case 'getResponses': {
        const {
          page = 1,
          limit = 20,
          formId,
          parentId,
          search = '',
          formField,
          onlyMy = false,
          workFlowFormReponseParentId = null,
        } = args;
        let filter: any = { formId };
        if (parentId) {
          filter = { ...filter, parentId };
        }
        if (workFlowFormReponseParentId) {
          filter = { ...filter, workFlowFormReponseParentId };
        }
        if (onlyMy && user?._id) {
          filter.createdBy = user?._id;
        }
        if (search && formField) {
          filter = {
            ...filter,
            $and: [
              { 'values.value': { $regex: search, $options: 'i' } },
              { 'values.field': formField },
            ],
          };
        }
        const data = await ResponseModel.find(filter)
          .sort({ createdAt: -1 })
          .populate(responsePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ResponseModel.countDocuments(filter);
        return {
          data,
          count,
        };
      }
      case 'createResponse': {
        args = { ...args, count: 1 };
        const lastResponse = await ResponseModel.findOne({ formId: args.formId }).sort('-count');
        if (lastResponse) {
          args = { ...args, count: lastResponse?.count + 1 };
        }
        const res: any = await FormModel.findById(args.formId).populate(formPopulate);
        const form = { ...res.toObject() };
        let emailId = '';
        const action = form.settings?.actions?.filter((a) => a.actionType === 'generateNewUser')[0];
        emailId = action?.emailFieldId;
        let email = '';
        lastResponse?.values.forEach((element) => {
          if (element.field === emailId) {
            email = element.value;
          }
        });
        if (email) {
          const tempUser = await User.findOne({ email: email });
          if (tempUser) {
            args = { ...args, createdBy: tempUser._id };
          }
        }
        const oldOptions = { ...args.options };

        if (args?.options) {
          const { password, ...options } = args?.options;
          args = { ...args, options };
        }
        let response = await ResponseModel.create(args);
        response = await response.populate(responsePopulate).execPopulate();
        // Run Actions
        const createGroupActionType = form?.settings?.actions?.filter(
          (e) => e.actionType === 'createCognitoGroup',
        )[0];
        if (createGroupActionType?.actionType === 'createCognitoGroup') {
          const ResponseValue = args?.values
            ?.filter((e) => e.field === createGroupActionType?.cognitoGroupName)[0]
            ?.value.trim();
          const Desc = args?.values
            ?.filter((e) => e?.field === createGroupActionType?.cognitoGroupDesc)[0]
            ?.value.trim();
          const payload = {
            GroupName: ResponseValue,
            UserPoolId: createGroupActionType?.userPoolId,
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
        } else {
          if (!(process.env.NODE_ENV === 'test')) {
            const res: any = await FormModel.findById(response?.formId).populate(formPopulate);
            const form = { ...res.toObject() };
            const act = form?.settings?.actions?.filter((e) => e.triggerType === 'onCreate');
            if (form && act) {
              await runFormActions(
                { ...response.toObject(), options: oldOptions },
                {
                  ...form,
                  settings: {
                    ...form.settings,
                    actions: args?.options?.actions || form.settings?.actions,
                  },
                },
                args?.parentId,
              );
              await sendResponseNotification(form, response);
            }
          }
        }
        return response;
      }
      case 'updateResponse': {
        const response: any = await ResponseModel.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });

        const oldOptions = { ...args.options };
        const res: any = await FormModel.findById(response.formId).populate(formPopulate);
        const form = { ...res.toObject() };

        const createGroupActionType = form?.settings?.actions?.filter(
          (e) => e.actionType === 'updateCognitoGroup',
        )[0];
        if (createGroupActionType?.actionType === 'updateCognitoGroup') {
          const ResponseValue = args?.values
            ?.filter((e) => e.field === createGroupActionType?.cognitoGroupName)[0]
            ?.value.trim();
          const Desc = args?.values
            ?.filter((e) => e?.field === createGroupActionType?.cognitoGroupDesc)[0]
            ?.value.trim();
          const payload = {
            GroupName: ResponseValue,
            UserPoolId: createGroupActionType?.userPoolId,
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
        } else {
          if (!(process.env.NODE_ENV === 'test')) {
            const res: any = await FormModel.findById(response?.formId).populate(formPopulate);
            const form = { ...res.toObject() };
            const act = form?.settings?.actions?.filter((e) => e.triggerType === 'onUpdate');
            if (form && act) {
              await runFormActions(
                { ...response.toObject(), options: oldOptions },
                {
                  ...form,
                  settings: {
                    ...form.settings,
                    actions: args?.options?.actions || form.settings?.actions,
                  },
                },
                args?.parentId,
              );
              await sendResponseNotification(form, response);
            }
          }
        }
        return await response.populate(responsePopulate).execPopulate();
      }
      case 'deleteResponse': {
        const response: any = await ResponseModel.findByIdAndDelete(args._id);
        const oldOptions = { ...args.options };

        const res: any = await FormModel.findById(response.formId).populate(formPopulate);
        const form = { ...res.toObject() };
        const createGroupActionType = form?.settings?.actions?.filter(
          (e) => e.actionType === 'deleteCognitoGroup',
        )[0];
        if (createGroupActionType?.actionType === 'deleteCognitoGroup') {
          const ResponseValue = response?.values
            ?.filter((e) => e.field === createGroupActionType?.cognitoGroupName)[0]
            ?.value.trim();
          const payload = {
            GroupName: ResponseValue,
            UserPoolId: createGroupActionType?.userPoolId,
          };
          const highPriorityGroup = [
            'superadmin',
            'us-east-1_eBnsz43bl_Facebook',
            'us-east-1_eBnsz43bl_Google',
          ];
          if (!highPriorityGroup.includes(payload.GroupName)) await deleteCognitoGroup(payload);
          else
            return {
              message: 'you are not allowd for this action',
            };
        } else {
          if (!(process.env.NODE_ENV === 'test')) {
            const res: any = await FormModel.findById(response?.formId).populate(formPopulate);
            const form = { ...res?.toObject() };
            const act = form?.settings?.actions?.filter((e) => e.triggerType === 'onDelete');
            if (form && act) {
              await runFormActions(
                { ...response.toObject(), options: oldOptions },
                {
                  ...form,
                  settings: {
                    ...form.settings,
                    actions: args?.options?.actions || form.settings?.actions,
                  },
                },
                args?.parentId,
              );
              await sendResponseNotification(form, response);
            }
          }
        }
        return args._id;
      }
      case 'getMyResponses': {
        const { page = 1, limit = 20 } = args;
        const data = await ResponseModel.find({ createdBy: user._id })
          .sort({ createdAt: -1 })
          .populate(myResponsePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ResponseModel.countDocuments({ createdBy: user._id });
        return {
          data,
          count,
        };
      }
      case 'createBulkResponses': {
        const { formId, fileUrl, map, parentId, createdBy } = args;

        const filter: any = Object.values(map);
        const fields = Object.keys(map);
        const fileData = await fileParser(fileUrl, filter);

        const responses: any = [];

        fileData.map((file) => {
          const response = {
            formId: formId,
            parentId: parentId,
            values: [{}],
            createdBy: createdBy,
          };
          for (let i = 0; i < fields.length; i++) {
            const value = {
              field: fields[i],
              value: file[filter[i]],
              valueNumber: null,
              valueBoolean: null,
              valueDate: null,
              page: null,
              media: [],
            };
            response.values.push(value);
            if (i === fields.length - 1) response.values.shift();
          }
          responses.push(response);
        });

        const responseCreated = await ResponseModel.create(responses);
        // responseCreated = await responseCreated.populate(responsePopulate).execPopulate();
        // Run Actions
        // const form = await FormModel.findById(responseCreated.formId);
        // await runFormActions(responseCreated, form);
        // if (!(process.env.NODE_ENV === 'test')) {
        //   await sendResponseNotification(form, responseCreated);
        // }
        return true;
      }
      case 'getSection': {
        let section = await SectionModel.findById(args._id).populate(sectionPopulate);
        if (section) {
          return section;
        } else if (user?._id) {
          section = await SectionModel.create({ _id: args._id, createdBy: user._id });
          return await section.populate(sectionPopulate).execPopulate();
        }
        return null;
      }
      case 'createSection': {
        return await SectionModel.create({ createdBy: user._id });
      }
      case 'updateSection': {
        const section: any = await SectionModel.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        if (section) {
          return await section.populate(sectionPopulate).execPopulate();
        }
        return null;
      }
      case 'getCheckUnique' : {
        const latestResponse = await ResponseModel.find({ formId: args._id });
        let finalRes = { res: false, fieldId: ""}
        latestResponse.map((response, i) => {
          response?.values?.map((val, j) => {
              if(val.value === args.values[0].value){
                finalRes = { res: true, fieldId: val.field}
              }         
          })
        })
        return finalRes
      }
      default:
        throw new Error('Something went wrong! Please check your Query or Mutation');
    }
  } catch (error) {
    if (error.runThis) {
      await Template.findOne();
      await Page.findOne();
    }
    const error2 = error;
    throw error2;
  }
};
