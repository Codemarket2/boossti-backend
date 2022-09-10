import { FormModel } from '../utils/formModel';
import { ResponseModel, responsePopulate } from '../utils/responseModel';
import { IResponse } from '../types/response';
import { getFieldByLabel } from './fieldHelper';
import { resolveCondition } from '../condition/resolveCondition';
import { systemForms } from './systemFormsConfig';
import { ICondition } from '../types/form';
import { getUserAttributes } from '../utils/actionHelper';

interface AuthorizationPayload {
  actionType: 'CREATE' | 'VIEW' | 'EDIT' | 'DELETE';
  user: IResponse;
  response: IResponse;
  formId: string;
}

export const authorization = async ({
  actionType,
  user,
  formId,
  response,
}: AuthorizationPayload) => {
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

    // Get User Permission By Roles
    const permissionsForm = await FormModel.findOne({ slug: systemForms.permissions.slug }).lean();
    if (!permissionsForm?._id) throw new Error('permissions form not found');

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

    // Get User Permission By Roles
    const actionPermissionsForm = await FormModel.findOne({
      slug: systemForms.actionPermissions.slug,
    }).lean();
    if (!actionPermissionsForm?._id) throw new Error('actionPermissions form not found');

    const actionTypeField = getFieldByLabel(
      systemForms.actionPermissions.fields.actionType,
      actionPermissionsForm?.fields,
    );
    const conditionField = getFieldByLabel(
      systemForms.actionPermissions.fields.condition,
      actionPermissionsForm?.fields,
    );

    let conditions: ICondition[] = [];
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
            const tempConditions = value?.response?.values?.find(
              (v) => v?.field?.toString() === conditionField?._id?.toString(),
            )?.options?.conditions;
            if (tempConditions?.length > 0) {
              conditions = [...conditions, ...tempConditions];
            }
          }
        });
      });
    });

    if (!(conditions?.length > 0)) {
      throw new Error(`No permissions found for ${actionType} actionType`);
    }

    const userAttributes = getUserAttributes(userForm, user);
    const result = await resolveCondition({
      conditions,
      leftPartResponse: response,
      authState: userAttributes,
    });
    if (!result) throw new Error('User is not authorized');
  } catch (error) {
    console.log(error);
    throw new Error(
      `You are not authorized to perform this action, you don't have enough permission`,
    );
  }
};
