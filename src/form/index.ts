import slugify from 'slugify';
import { DB } from '../utils/DB';
import { FormModel, formPopulate } from './utils/formModel';
import { ResponseModel, responsePopulate, myResponsePopulate } from './utils/responseModel';
import { SectionModel, sectionPopulate } from './utils/sectionModel';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/customTypes';
import { runFormActions } from './utils/actions';
import { sendResponseNotification } from './utils/responseNotification';
import { fileParser } from './utils/readCsvFile';
import { runInTransaction } from '../utils/runInTransaction';
import { IForm } from './types/form';
import { authorization, AuthorizationActionTypes } from './permission/authorization';
import { IResponse } from './types/response';
import { resolveCondition } from './condition/resolveCondition';
import { getUserAttributes } from './utils/actionHelper';
import { systemForms } from './permission/systemFormsConfig';
import { getFormIds, getFormsByIds } from './condition/getConditionForm';
import { getLeftPartValue } from './condition/getConditionPartValue';
import { formAuthorization } from './permission/formAuthorization';

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
    if (fieldName.toLocaleLowerCase().includes('create') && user?._id) {
      args = { ...args, createdBy: user?._id };
    } else if (fieldName.toLocaleLowerCase().includes('update') && user?._id) {
      args = { ...args, updatedBy: user?._id };
    }

    switch (fieldName) {
      case 'getForm': {
        return await FormModel.findById(args._id).populate(formPopulate);
      }
      case 'getFormRelations': {
        return await FormModel.find({
          fields: { $elemMatch: { form: args?._id, 'options.twoWayRelationship': true } },
        }).populate(formPopulate);
      }
      case 'getFormTabRelations': {
        return await FormModel.find({
          'settings.tabs': { $elemMatch: { 'form._id': args?._id } },
        }).populate(formPopulate);
      }
      case 'getFormAllTabs': {
        const { formId } = args;
        return await FormModel.find({
          _id: { $ne: formId },
          'settings.tabs': { $elemMatch: { 'options.addToAllForms': true } },
        }).populate(formPopulate);
      }
      case 'getFormBySlug': {
        return await FormModel.findOne({ slug: args.slug }).populate(formPopulate);
      }
      case 'getForms': {
        const { page = 1, limit = 20, search = '' } = args;
        const { isSuperAdmin, formIds } = await formAuthorization({ user });
        const filter: any = { name: { $regex: search, $options: 'i' } };
        if (!isSuperAdmin) {
          filter._id = { $in: formIds };
        }
        const data = await FormModel.find(filter)
          .populate(formPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await FormModel.countDocuments(filter);
        return {
          data,
          count,
        };
      }
      case 'createForm': {
        return await runInTransaction({
          action: 'CREATE',
          Model: FormModel,
          args,
          populate: formPopulate,
          user,
        });
      }
      case 'updateForm': {
        return await runInTransaction({
          action: 'UPDATE',
          Model: FormModel,
          args,
          populate: formPopulate,
          user,
        });
      }
      case 'deleteForm': {
        const callback = async (session, form) => {
          await ResponseModel.deleteMany({ formId: form?._id });
        };
        const form = await runInTransaction(
          {
            action: 'DELETE',
            Model: FormModel,
            args,
            user,
          },
          callback,
        );
        return form._id;
      }
      case 'getResponse': {
        const response: any = await ResponseModel.findById(args?._id)
          .populate(responsePopulate)
          .lean();
        await authorization({
          user,
          actionType: AuthorizationActionTypes.VIEW,
          formId: response?.formId,
          response,
          appId: args?.appId,
        });
        return response;
      }
      case 'getResponseByCount': {
        const response: any = await ResponseModel.findOne(args).populate(responsePopulate).lean();
        if (!response?._id) throw new Error('response not found');
        await authorization({
          user,
          actionType: AuthorizationActionTypes.VIEW,
          formId: response?.formId,
          response,
          appId: args?.appId,
        });
        // const oldOptions = { ...args.options };
        // if (!(process.env.NODE_ENV === 'test')) {
        //   const res: any = await FormModel.findById(response?.formId).populate(formPopulate);
        //   const form = { ...res.toObject() };
        //   await runFormActions({
        //     triggerType: 'onView',
        //     form: {
        //       ...form,
        //       settings: {
        //         ...form.settings,
        //         actions: args?.options?.actions || form.settings?.actions,
        //       },
        //     },
        //     response: { ...response.toObject(), options: oldOptions },
        //   });
        // }
        return response;
      }
      case 'getResponses': {
        const {
          page = 1,
          limit = 20,
          formId,
          search = '',
          formField,
          onlyMy = false,
          workFlowFormResponseParentId = null,
          valueFilter,
          appId,
        } = args;
        let filter: any = { formId };
        if (appId) {
          filter = { ...filter, appId };
        }
        if (workFlowFormResponseParentId) {
          filter = { ...filter, workFlowFormResponseParentId };
        }
        if (onlyMy && user?._id) {
          filter.createdBy = user?._id;
        }
        if (valueFilter) {
          filter = { ...filter, ...valueFilter };
        }
        if (search && formField) {
          filter = {
            ...filter,
            $or: [{ 'values.value': { $regex: search, $options: 'i' } }],
          };
        }

        let runLoop = true;
        const data: IResponse[] = [];
        let pointer = 0;
        let errorCount = 0;
        while (runLoop) {
          try {
            const response: any = await ResponseModel.findOne(filter)
              .populate(responsePopulate)
              .sort({ createdAt: -1 })
              .skip((page - 1) * limit + pointer)
              .lean();
            pointer += 1;
            if (response?._id) {
              await authorization({
                user,
                actionType: AuthorizationActionTypes.VIEW,
                formId: response?.formId,
                response,
                appId: args?.appId,
              });
              data.push(response);
              if (data.length >= limit) {
                runLoop = false;
              }
            } else {
              runLoop = false;
            }
          } catch (error) {
            errorCount += 1;
          }
        }
        const count = await ResponseModel.countDocuments(filter);
        return {
          data,
          count,
        };
      }
      case 'createResponse': {
        args = { ...args, count: 1 };
        await authorization({
          user,
          actionType: AuthorizationActionTypes.CREATE,
          formId: args.formId,
          // response: null,
          appId: args?.appId,
        });
        const lastResponse = await ResponseModel.findOne({ formId: args.formId }).sort('-count');
        if (lastResponse) {
          args = { ...args, count: lastResponse?.count + 1 };
        }
        const callback = async (session, response) => {
          // Run Actions
          const res: any = await FormModel.findById(args.formId)
            .populate(formPopulate)
            .session(session);
          const form: any = { ...res.toObject() };
          form.settings = form.settings || {};
          form.settings.actions = args?.options?.actions || form.settings?.actions;
          response.options = args.options;
          await runFormActions({
            triggerType: 'onCreate',
            form,
            response,
            args,
            session,
          });

          await sendResponseNotification({ session, form, response });
        };
        const response = await runInTransaction(
          {
            action: 'CREATE',
            Model: ResponseModel,
            args,
            populate: responsePopulate,
            user,
          },
          callback,
        );
        return response;
      }
      case 'updateResponse': {
        const tempResponse: any = await ResponseModel.findById(args?._id)
          .populate(responsePopulate)
          .lean();
        await authorization({
          user,
          actionType: AuthorizationActionTypes.EDIT,
          formId: tempResponse?.formId,
          response: tempResponse,
          appId: args?.appId,
        });
        const callback = async (session, response) => {
          const res: any = await FormModel.findById(response.formId).populate(formPopulate);
          const form = { ...res.toObject() };
          form.settings = form.settings || {};
          form.settings.actions = args?.options?.actions || form.settings?.actions;
          response.options = args.options;
          await runFormActions({
            triggerType: 'onUpdate',
            form,
            response,
            args,
            session,
          });
          // await sendResponseNotification(form, response);
        };
        if (args?.appId) {
          delete args?.appId;
        }
        const response = await runInTransaction(
          {
            action: 'UPDATE',
            Model: ResponseModel,
            args,
            populate: responsePopulate,
            user,
          },
          callback,
        );
        return response;
      }
      case 'deleteResponse': {
        const tempResponse: any = await ResponseModel.findById(args?._id)
          .populate(responsePopulate)
          .lean();
        await authorization({
          user,
          actionType: AuthorizationActionTypes.DELETE,
          formId: tempResponse?.formId,
          response: tempResponse,
          appId: args?.appId,
        });
        const callback = async (session, response) => {
          const res: any = await FormModel.findById(response.formId).populate(formPopulate);
          const form: IForm = { ...res?.toObject() };
          form.settings = form.settings || {};
          form.settings.actions = args?.options?.actions || form.settings?.actions;
          response.options = args.options;

          const relationFieldIds: string[] = [];
          form?.fields?.forEach((field) => {
            if (field?.fieldType === 'response' && !field?.options?.selectItem) {
              relationFieldIds.push(field?._id?.toString());
            }
          });
          if (relationFieldIds?.length > 0) {
            const responseIds: string[] = [];
            response?.values?.forEach((value) => {
              if (
                relationFieldIds?.includes(value?.field?.toString()) &&
                (value?.response?._id || value?.response)
              ) {
                responseIds?.push(value?.response?._id || value?.response);
              }
            });
            if (responseIds?.length > 0) {
              await ResponseModel.deleteMany({ _id: { $in: responseIds } });
            }
          }
          await runFormActions({
            triggerType: 'onDelete',
            form,
            response,
            args,
            session,
          });
          // await sendResponseNotification(form, response);
        };
        const response = await runInTransaction(
          {
            action: 'DELETE',
            Model: ResponseModel,
            args,
            user,
          },
          callback,
        );
        return response._id;
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
        // responseCreated = await responseCreated.populate(responsePopulate) //.execPopulate();
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
          return await section.populate(sectionPopulate); //.execPopulate();
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
          return await section.populate(sectionPopulate); //.execPopulate();
        }
        return null;
      }
      case 'getCheckUnique': {
        const { formId, responseId, valueFilter = {}, appId } = args;
        let filter: any = {
          formId,
          ...valueFilter,
          appId,
        };
        if (responseId) {
          filter = {
            ...filter,
            _id: { $ne: responseId },
          };
        }
        const response = await ResponseModel.findOne(filter).lean();
        return response?._id;
      }
      case 'resolveCondition': {
        const { responseId, conditions } = args;
        const userForm = await FormModel.findOne({ slug: systemForms.users.slug });
        const userAttributes = getUserAttributes(userForm, user);
        const response = await ResponseModel.findById(responseId).populate(responsePopulate).lean();
        if (!response?._id) throw new Error('Response not found');
        const conditionResult = await resolveCondition({
          leftPartResponse: response,
          authState: userAttributes,
          conditions,
        });
        // debugger;
        return conditionResult;
      }
      case 'checkUniqueBetweenMultipleValues': {
        const { responseIds = [], subField } = args;
        let isDuplicateValue = false;
        if (responseIds?.length > 1) {
          const formIds = getFormIds(subField);
          const forms = await getFormsByIds(formIds);
          const values: any = [];
          for (const responseId of responseIds) {
            const response = await ResponseModel.findById(responseId);
            if (response?._id) {
              const value = await getLeftPartValue({
                conditionPart: subField,
                forms,
                response,
              });
              if (value) {
                if (values?.includes(value)) {
                  isDuplicateValue = true;
                }
                values.push(value);
              }
            }
          }
        }
        return isDuplicateValue;
      }
      default:
        throw new Error('Something went wrong! Please check your Query or Mutation');
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
