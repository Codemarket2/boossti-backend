import slugify from 'slugify';
import { DB } from '../utils/DB';
import { FormModel, formPopulate } from './utils/formModel';
import { ResponseModel, responsePopulate, myResponsePopulate } from './utils/responseModel';
import { SectionModel, sectionPopulate } from './utils/sectionModel';
import Template from '../template/utils/templateModel';
import Page from '../template/utils/pageModel';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/customTypes';
import { runFormActions } from './utils/actions';
import { sendResponseNotification } from './utils/responseNotification';
import getAdminFilter from '../utils/adminFilter';
import { fileParser } from './utils/readCsvFile';
import { runInTransaction } from '../utils/runInTransaction';
import { IForm } from './types/form';
import { authorization, AuthorizationActionTypes } from './permission/authorization';

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
          // settings: {
          //   tabs: { $elemMatch: { 'form._id': args?._id } },
          // },
        }).populate(formPopulate);
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
        return await ResponseModel.findById(args._id).populate(responsePopulate);
      }
      case 'getResponseByCount': {
        const response: any = await ResponseModel.findOne(args).populate(responsePopulate).lean();
        // await authorization({ user, actionType: AuthorizationActionTypes.VIEW, formId: response?.formId, response });
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
          installId,
        } = args;
        let filter: any = { formId };
        if (appId) {
          filter = { ...filter, appId };
        }
        if (installId) {
          filter = { ...filter, installId };
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
        // await authorization({
        //   user,
        //   actionType: AuthorizationActionTypes.CREATE,
        //   formId: args.formId,
        //   // response: null,
        // });
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
        // const tempResponse: any = await ResponseModel.findById(args?._id)
        //   .populate(responsePopulate)
        //   .lean();
        // await authorization({
        //   user,
        //   actionType: AuthorizationActionTypes.EDIT,
        //   formId: tempResponse?.formId,
        //   response: tempResponse,
        // });
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
        if (process?.env?.NODE_ENV !== 'test') {
          await authorization({
            user,
            actionType: AuthorizationActionTypes.DELETE,
            formId: tempResponse?.formId,
            response: tempResponse,
          });
        }
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
        const { formId, responseId, value, caseInsensitiveUnique = false } = args;
        let filter: any = {
          formId,
          values: { $elemMatch: { value: value.value, field: value.field } },
        };
        if (caseInsensitiveUnique) {
          filter = {
            ...filter,
            values: {
              $elemMatch: { value: { $regex: new RegExp(`^${value?.value}$`), $options: 'i' } },
            },
          };
        }
        if (responseId) {
          filter = {
            ...filter,
            _id: { $ne: responseId },
          };
        }
        const response = await ResponseModel.findOne(filter);
        return Boolean(response?._id);
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
