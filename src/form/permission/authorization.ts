import { FormModel } from '../utils/formModel';
import { ResponseModel, responsePopulate } from '../utils/responseModel';
import { IResponse } from '../types/response';
import { getFieldByLabel } from './fieldHelper';
import { resolveCondition } from '../condition/resolveCondition';
import { systemForms } from './systemFormsConfig';
import { ICondition } from '../types/form';
import { getUserAttributes } from '../utils/actionHelper';

export enum AuthorizationActionTypes {
  CREATE = 'CREATE',
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
}

interface AuthorizationPayload {
  actionType: AuthorizationActionTypes;
  user: IResponse;
  response?: IResponse;
  formId: string;
}

export const authorization = async ({
  actionType,
  user,
  formId,
  response,
}: AuthorizationPayload) => {
  try {
    if (process?.env?.NODE_ENV === 'test') return true;
    if (!actionType || !user?._id || !formId) {
      throw new Error('actionType, user, formId not found in payload');
    }
    // Get User Roles
    if (!user?._id) throw new Error('User not found');
    const { userForm, permissionsForm, actionPermissionsForm } = await getForms();

    const rolesField = getFieldByLabel(systemForms.users.fields.roles, userForm?.fields);
    if (!rolesField?._id) throw new Error('roles field not found in users form');

    let isSuperAdmin = false;
    const userRoleIds: string[] = [];
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

    if (!(userRoleIds?.length > 0)) {
      throw new Error("user doesn't have any roles");
    }
    if (isSuperAdmin) {
      return true;
    }

    // Get User Permission By Roles

    const permissionFormRoleField = getFieldByLabel(
      systemForms.permissions.fields.role,
      permissionsForm?.fields,
    );
    if (!permissionFormRoleField?._id) throw new Error('role field not found in permissions form');
    const permissionFormFormField = getFieldByLabel(
      systemForms.permissions.fields.form,
      permissionsForm?.fields,
    );
    if (!permissionFormFormField?._id) throw new Error('form field not found in permissions form');

    const permissionFormActionField = getFieldByLabel(
      systemForms.permissions.fields.actionPermissions,
      permissionsForm?.fields,
    );
    if (!permissionFormRoleField?._id) throw new Error('action field not found in permission form');

    const userPermissions = await ResponseModel.find({
      formId: permissionsForm?._id,
      $and: [
        { 'values.field': permissionFormRoleField?._id, 'values.response': { $in: userRoleIds } },
        { 'values.field': permissionFormFormField?._id, 'values.form': formId },
      ],
    })
      .populate(responsePopulate)
      .lean();
    if (!(userPermissions?.length > 0)) throw new Error(`user doesn't have permission`);

    const actionTypeField = getFieldByLabel(
      systemForms.actionPermissions.fields.actionType,
      actionPermissionsForm?.fields,
    );
    const conditionField = getFieldByLabel(
      systemForms.actionPermissions.fields.condition,
      actionPermissionsForm?.fields,
    );

    let conditions: ICondition[][] = [];
    let hasCreateActionPermission = false;
    userPermissions.forEach((perm) => {
      const actionPermissionValues = perm.values?.filter(
        (value) => value?.field?.toString() === permissionFormActionField?._id?.toString(),
      );
      actionPermissionValues.forEach((value) => {
        value?.response?.values?.forEach((v) => {
          if (
            v?.field?.toString() === actionTypeField?._id?.toString() &&
            v?.value === actionType
          ) {
            if (actionType === AuthorizationActionTypes.CREATE) {
              hasCreateActionPermission = true;
            }
            const tempConditions = value?.response?.values?.find(
              (v) => v?.field?.toString() === conditionField?._id?.toString(),
            )?.options?.conditions;
            if (tempConditions?.length > 0) {
              conditions = [...conditions, tempConditions];
            }
          }
        });
      });
    });

    if (hasCreateActionPermission && actionType === AuthorizationActionTypes.CREATE) {
      return;
    }

    if (!(conditions?.length > 0)) {
      throw new Error(`No permissions found for ${actionType} actionType`);
    }
    // debugger;
    const userAttributes = getUserAttributes(userForm, user);
    const results: boolean[] = [];
    for (const condition of conditions) {
      if (!results?.some((result) => result)) {
        const conditionResult = await resolveCondition({
          conditions: condition,
          leftPartResponse: response,
          authState: userAttributes,
        });
        results.push(conditionResult);
      }
    }
    // debugger;
    if (!results?.some((result) => result)) throw new Error('User is not authorized');
    return;
  } catch (error) {
    console.log(error);
    // debugger;
    throw new Error(
      `You are not authorized to perform this action, you don't have enough permission.`,
    );
  }
};

const getForms = async () => {
  const forms = await FormModel.find({
    slug: {
      $in: [
        systemForms.users.slug,
        systemForms.permissions.slug,
        systemForms.actionPermissions.slug,
      ],
    },
  })?.lean();

  const userForm = forms?.find((form) => form?.slug === systemForms.users.slug);
  if (!userForm?._id) throw new Error('users form not found');

  const permissionsForm = forms?.find((form) => form?.slug === systemForms.permissions.slug);
  if (!permissionsForm?._id) throw new Error('permissions form not found');

  const actionPermissionsForm = forms?.find(
    (form) => form?.slug === systemForms.actionPermissions.slug,
  );
  if (!actionPermissionsForm?._id) throw new Error('action permissions form not found');

  return { userForm, permissionsForm, actionPermissionsForm };
};