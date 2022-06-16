import slugify from 'slugify';
import { DB } from '../utils/DB';
import Template, { templatePopulate } from './utils/templateModel';
import { TemplateInstanceModel, templateInstancePopulate } from './utils/templateInstanceModel';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/customTypes';
// import getAdminFilter from '../utils/adminFilter';
import { User } from '../user/utils/userModel';
import { runInTransaction } from '../utils/runInTransaction';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const { identity } = event;
    // debugger;
    const user = await getCurrentUser(identity);
    let args = { ...event.arguments };

    if (fieldName.toLocaleLowerCase().includes('create') && user && user._id) {
      args = { ...args, createdBy: user._id };
    } else if (fieldName.toLocaleLowerCase().includes('update') && user && user._id) {
      args = { ...args, updatedBy: user._id };
    }

    if (
      (fieldName.toLocaleLowerCase().includes('create') ||
        fieldName.toLocaleLowerCase().includes('update')) &&
      Object.prototype.hasOwnProperty.call(args, 'title')
    ) {
      args = { ...args, slug: slugify(args.title, { lower: true }) };
    } else if (
      (fieldName.toLocaleLowerCase().includes('create') ||
        fieldName.toLocaleLowerCase().includes('update')) &&
      Object.prototype.hasOwnProperty.call(args, 'slug')
    ) {
      args = { ...args, slug: slugify(args.slug, { lower: true }) };
    }

    switch (fieldName) {
      case 'getTemplates': {
        const { page = 1, limit = 20, search = '', active = null } = args;
        const tempFilter: any = {};
        if (active !== null) {
          tempFilter.active = active;
        }
        const data = await Template.find({
          ...tempFilter,
          title: { $regex: search, $options: 'i' },
        })
          .populate(templatePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await Template.countDocuments({
          ...tempFilter,
          title: { $regex: search, $options: 'i' },
        });
        return {
          data,
          count,
        };
      }
      case 'getMenuTemplates': {
        return await Template.find({
          showInMenu: true,
          active: true,
        }).select('title slug');
      }
      case 'getMentionItems': {
        const { search = '' } = args;
        let pages: any = await TemplateInstanceModel.find({
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        })
          .populate(templateInstancePopulate)
          .limit(5);

        pages = pages.map(
          (val) =>
            (val = {
              title: val.title,
              _id: val._id,
              category: val.template[0].title,
              type: 'page',
            }),
        );

        let users: any = await User.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }).limit(5);

        users = users.map(
          (val) => (val = { title: val.name, _id: val._id, category: val.email, type: 'user' }),
        );
        const combinedItems = pages.concat(users);
        return combinedItems;
      }
      case 'getTemplateInstanceMentions': {
        const { page = 1, _id, limit = 20, parentId, field, onlyShowByUser = null } = args;
        const tempFilter: any = {};
        if (onlyShowByUser) {
          tempFilter.createdBy = user._id;
        }
        const data = await TemplateInstanceModel.find({
          'fields.options.values.value': { $regex: `data-id="${_id}"`, $options: 'i' },
        })
          .populate(templateInstancePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await TemplateInstanceModel.countDocuments({
          ...tempFilter,
          parentId,
          field,
        });
        return {
          data,
          count,
        };
      }
      case 'getTemplateBySlug': {
        return await Template.findOne({ slug: args.slug }).populate(templatePopulate);
      }
      case 'getTemplate': {
        return await Template.findById(args._id).populate(templatePopulate);
      }
      case 'createTemplate': {
        let count = 1;
        args = { ...args, count };
        const lastTemplate = await Template.findOne().sort('-count');
        if (lastTemplate) {
          count = lastTemplate?.count + 1;
          args = { ...args, count };
        }
        return await runInTransaction({
          action: 'CREATE',
          Model: Template,
          args,
          populate: templatePopulate,
          user,
        });
      }
      case 'updateTemplate': {
        return await runInTransaction({
          action: 'UPDATE',
          Model: Template,
          args,
          populate: templatePopulate,
          user,
        });
      }
      case 'deleteTemplate': {
        await runInTransaction({
          action: 'DELETE',
          Model: Template,
          args,
          populate: templatePopulate,
          user,
        });
        return args?._id;
      }
      case 'getTemplateInstances': {
        const { page = 1, limit = 20, search = '', active = null, template = null } = args;
        const tempFilter: any = {};
        if (active !== null) {
          tempFilter.active = active;
        }
        if (template) {
          tempFilter.template = template;
        }
        // const adminFilter = getAdminFilter(identity, user);
        const data = await TemplateInstanceModel.find({
          ...tempFilter,
          // ...adminFilter,
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        })
          .populate(templateInstancePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await TemplateInstanceModel.countDocuments({
          ...tempFilter,
          // ...adminFilter,
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        });
        return {
          data,
          count,
        };
      }
      case 'getTemplateInstanceBySlug': {
        return await TemplateInstanceModel.findOne({ slug: args.slug }).populate(
          templateInstancePopulate,
        );
      }
      case 'getTemplateInstance': {
        return await TemplateInstanceModel.findById(args._id).populate(templateInstancePopulate);
      }
      case 'createTemplateInstance': {
        const page = await TemplateInstanceModel.create(args);
        return await page.populate(templateInstancePopulate); //.execPopulate();
      }
      case 'updateTemplateInstance': {
        const page: any = await TemplateInstanceModel.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        return await page.populate(templateInstancePopulate); //.execPopulate();
      }
      case 'deleteTemplateInstance': {
        await TemplateInstanceModel.findByIdAndDelete(args._id);
        return args._id;
      }
      default:
        throw new Error('Something went wrong! Please check your Query or Mutation');
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
