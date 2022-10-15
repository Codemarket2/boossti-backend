import { FormModel } from '../utils/formModel';
import { ResponseModel, responsePopulate } from '../utils/responseModel';
import { getFieldByLabel } from './fieldHelper';
import { systemForms } from './systemFormsConfig';

interface GetUserRoleIdsPayload {
  user: any;
  userForm: any;
}

export const getUserRoleIds = async ({ user, userForm }: GetUserRoleIdsPayload) => {
  // Get User Roles
  const rolesField = getFieldByLabel(systemForms.users.fields.roles, userForm?.fields);
  if (!rolesField?._id) throw new Error('roles field not found in users form');
  const userRoleIds: string[] = [];
  let isSuperAdmin = false;

  if (user?._id) {
    user?.values?.forEach((value) => {
      if (
        value?.field?.toString() === rolesField?._id?.toString() &&
        value?.response?._id &&
        !userRoleIds.includes(value?.response?._id)
      ) {
        userRoleIds.push(value?.response?._id);
        const roleName = value?.response?.values?.find(
          (v) => v?.field === rolesField?.options?.formField,
        )?.value;
        if (roleName === 'superadmin') {
          isSuperAdmin = true;
        }
      }
    });
  } else {
    const rolesForm = await FormModel.findOne({ slug: systemForms.roles.slug }).lean();
    if (!rolesForm?._id) throw new Error('roles form not found');
    const roleNamField = getFieldByLabel(systemForms.roles.fields.name, rolesForm?.fields);
    if (!roleNamField?._id) throw new Error('role name field not found in roles form');
    const guestRole = await ResponseModel.findOne({
      formId: rolesForm?._id,
      'values.field': roleNamField?._id,
      'values.value': 'guest',
    }).lean();
    if (!guestRole?._id) throw new Error('Guest role not found');
    userRoleIds.push(guestRole?._id);
  }

  return { userRoleIds, isSuperAdmin };
};

interface IGetAppUserRoleIds {
  userId: string;
  appId: string;
}

export const getAppUserRoleIds = async ({ userId, appId }: IGetAppUserRoleIds) => {
  // Get App User Roles
  const userRoleIds: string[] = [];
  let isSuperAdmin = false;

  const appUsersForm = await FormModel.findOne({ slug: systemForms.appUsers.slug }).lean();
  if (!appUsersForm?._id) throw new Error('app users form not found');

  const userField = getFieldByLabel(systemForms.appUsers.fields.user, appUsersForm?.fields);
  if (!userField?._id) throw new Error('user field not found in app users form');

  const appUserResponse = await ResponseModel.findOne({
    appId,
    'values.field': userField?._id,
    'values.response': userId,
  })
    .populate(responsePopulate)
    .lean();

  const rolesField = getFieldByLabel(systemForms.appUsers.fields.roles, appUsersForm?.fields);
  if (!rolesField?._id) throw new Error('roles field not found in app users form');

  if (appUserResponse?._id) {
    appUserResponse?.values?.forEach((value) => {
      if (
        value?.field?.toString() === rolesField?._id?.toString() &&
        value?.response?._id &&
        !userRoleIds.includes(value?.response?._id)
      ) {
        userRoleIds.push(value?.response?._id);
        const roleName = value?.response?.values?.find(
          (v) => v?.field === rolesField?.options?.formField,
        )?.value;
        if (roleName === 'superadmin') {
          isSuperAdmin = true;
        }
      }
    });
  } else {
    const rolesForm = await FormModel.findOne({ slug: systemForms.roles.slug }).lean();
    if (!rolesForm?._id) throw new Error('roles form not found');
    const roleNamField = getFieldByLabel(systemForms.roles.fields.name, rolesForm?.fields);
    if (!roleNamField?._id) throw new Error('role name field not found in roles form');
    const guestRole = await ResponseModel.findOne({
      appId,
      formId: rolesForm?._id,
      'values.field': roleNamField?._id,
      'values.value': 'guest',
    }).lean();
    if (!guestRole?._id) throw new Error('Guest role not found');
    userRoleIds.push(guestRole?._id);
  }

  return { userRoleIds, isSuperAdmin };
};
