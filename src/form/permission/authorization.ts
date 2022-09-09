import { FormModel } from '../utils/formModel';
import { ResponseModel, responsePopulate } from '../utils/responseModel';
import { IResponse } from '../utils/responseType';
import { getFieldByLabel } from './fieldHelper';
import { systemForms } from './systemFormsConfig';

interface AuthorizationPayload {
  actionType: 'CREATE' | 'VIEW' | 'EDIT' | 'DELETE';
  user: IResponse;
  formId: string;
}

export const authorization = async ({ user, formId }: AuthorizationPayload) => {
  try {
    // Get User Roles
    if (!user?._id) throw new Error('User not found');
    const userForm = await FormModel.findOne({ slug: systemForms.users.slug })?.lean();
    if (!userForm?._id) throw new Error('users form not found');

    const rolesField = getFieldByLabel(systemForms.users.fields.roles, userForm?.fields);
    if (!rolesField?._id) throw new Error('roles field not found in users form');

    const userRoleIds: string[] = [];
    user?.values?.forEach((value) => {
      if (
        value?.field?.toString() === rolesField?._id?.toString() &&
        value?.response?._id &&
        !userRoleIds.includes(value?.response?._id)
      ) {
        userRoleIds.push(value?.response?._id);
        return true;
      }
      return false;
    });

    if (!(userRoleIds?.length > 0)) {
      throw new Error("user doesn't have any roles");
    }

    // const rolesForm = await FormModel.findOne({ slug: systemForms.roles.slug });
    // if (!rolesField?._id) throw new Error('roles form not found');

    // Get User Permission By Roles
    const permissionsForm = await FormModel.findOne({ slug: systemForms.permissions.slug }).lean();
    if (!permissionsForm?._id) throw new Error('permissions form not found');

    const permissionFormRoleField = getFieldByLabel(
      systemForms.permissions.fields.role,
      permissionsForm?.fields,
    );
    if (!permissionFormRoleField?._id) throw new Error('role field in permissions form not found');

    const permissionFormActionField = getFieldByLabel(
      systemForms.permissions.fields.actionPermissions,
      permissionsForm?.fields,
    );
    if (!permissionFormRoleField?._id) throw new Error('role field in permissions form not found');

    const userPermissions = await ResponseModel.find({
      formId: permissionsForm?._id,
      'values.field': permissionFormRoleField?._id,
      'values.response': { $in: userRoleIds },
    })
      .populate(responsePopulate)
      .lean();
    if (!(userPermissions?.length > 0)) throw new Error(`user doesn't have permission`);

    // const permissionConditions:any =[]
    //  userPermissions.forEach(perm=>{
    //   const actionPermissionValues = per
    //   if(perm)
    //   return false
    //  })
    // debugger;

    //    return null;
  } catch (error) {
    console.log(error);
    // debugger;
    throw new Error('You are not authorized to perform this action');
  }
};
