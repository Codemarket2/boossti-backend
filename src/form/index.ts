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
import { runInTransaction } from '../utils/runInTransaction';

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
      args = { ...args, createdBy: user._id };
    } else if (fieldName.toLocaleLowerCase().includes('update') && user?._id) {
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
        const form = await runInTransaction({
          action: 'DELETE',
          Model: FormModel,
          args,
          user,
        });
        return form._id;
        // let formId;
        // await runInTransaction(
        //   async (session) => {
        //     const deletedForm: any = await FormModel.findByIdAndDelete(args._id, {
        //       session: session,
        //     });
        //     await ResponseModel.deleteMany({ formId: args._id }, { session: session });
        //     await SectionModel.findByIdAndDelete(args._id, { session: session });
        //     formId = deletedForm._id;
        //     return deletedForm;
        //   },
        //   { action: 'DELETE', model: FormModel },
        // );
        // return formId;
      }
      case 'getResponse': {
        return await ResponseModel.findById(args._id).populate(responsePopulate);
      }
      case 'getResponseByCount': {
        const response: any = await ResponseModel.findOne(args).populate(responsePopulate);
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
          parentId,
          search = '',
          formField,
          onlyMy = false,
          workFlowFormReponseParentId = null,
          templateId,
        } = args;
        let filter: any = { formId };
        if (parentId) {
          filter = { ...filter, parentId };
        }
        if (templateId) {
          filter = { ...filter, templateId };
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
        // debugger;
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
          if (!(process.env.NODE_ENV === 'test')) {
            await sendResponseNotification(form, response);
          }
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
          if (!(process.env.NODE_ENV === 'test')) {
            await sendResponseNotification(form, response);
          }
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
        const callback = async (session, response) => {
          const res: any = await FormModel.findById(response.formId).populate(formPopulate);
          const form = { ...res?.toObject() };
          form.settings = form.settings || {};
          form.settings.actions = args?.options?.actions || form.settings?.actions;
          response.options = args.options;
          await runFormActions({
            triggerType: 'onDelete',
            form,
            response,
            args,
            session,
          });
          if (!(process.env.NODE_ENV === 'test')) {
            await sendResponseNotification(form, response);
          }
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
