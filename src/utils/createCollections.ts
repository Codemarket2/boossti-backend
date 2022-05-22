import { AuditLogModel } from '../auditLog/utils/auditLogModel';
import { User } from '../user/utils/userModel';
import { FormModel } from '../form/utils/formModel';
import { ResponseModel } from '../form/utils/responseModel';
import TemplateModel from '../template/utils/templateModel';
import PageModel from '../template/utils/pageModel';

const models = [AuditLogModel, User, FormModel, ResponseModel, TemplateModel, PageModel];

export const createCollections = async () => {
  try {
    await Promise.all(models.map((model) => model.createCollection()));
  } catch (error) {
    console.log(`Error while creating collection ${error.message}`);
  }
};
