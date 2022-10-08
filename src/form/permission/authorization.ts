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
    if (!actionType || !formId) {
      throw new Error('actionType, formId not found in payload');
    }

    const { userForm, permissionsForm, roleActionConditionForm, actionPermissionsForm } =
      await getForms();

    // Get User Roles
    const rolesField = getFieldByLabel(systemForms.users.fields.roles, userForm?.fields);
    if (!rolesField?._id) throw new Error('roles field not found in users form');
    const userRoleIds: string[] = [];

    if (user?._id) {
      let isSuperAdmin = false;
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
      if (isSuperAdmin) {
        return true;
      }
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

    if (!(userRoleIds?.length > 0)) {
      throw new Error("user doesn't have any roles");
    }

    // Get User Permission By Roles
    const permissionFormRACField = getFieldByLabel(
      systemForms.permissions.fields.roleActionCondition,
      permissionsForm?.fields,
    );
    if (!permissionFormRACField?._id)
      throw new Error('role action condition field not found in permissions form');

    const permissionFormFormField = getFieldByLabel(
      systemForms.permissions.fields.form,
      permissionsForm?.fields,
    );
    if (!permissionFormFormField?._id) throw new Error('form field not found in permissions form');

    const roleActionConditionFormActionPermissionField = getFieldByLabel(
      systemForms.roleActionCondition.fields.actionPermissions,
      roleActionConditionForm?.fields,
    );
    if (!roleActionConditionFormActionPermissionField?._id)
      throw new Error('action field not found in permission form');

    const roleActionConditionFormRoleField = getFieldByLabel(
      systemForms.roleActionCondition.fields.role,
      roleActionConditionForm?.fields,
    );
    if (!roleActionConditionFormRoleField?._id)
      throw new Error('action field not found in permission form');

    const formPermission = await ResponseModel.findOne({
      formId: permissionsForm?._id,
      'values.field': permissionFormFormField?._id,
      'values.form': formId,
    })
      .populate(responsePopulate)
      .lean();
    if (!formPermission?._id) throw new Error(`No permission found for the form ${formId}`);
    const roleActionConditionValues = formPermission?.values?.filter(
      (value) => value?.field?.toString() === permissionFormRACField?._id?.toString(),
    );
    const actionPermissionsIds: string[] = [];
    roleActionConditionValues?.forEach((value) => {
      value?.response?.values?.forEach((v) => {
        const isTrue3 = userRoleIds?.some((_id) => _id?.toString() == v?.response?.toString());
        if (isTrue3 && v?.field?.toString() === roleActionConditionFormRoleField?._id?.toString()) {
          const actionPermissionId = value?.response?.values?.find(
            (v2) =>
              v2?.field?.toString() ===
              roleActionConditionFormActionPermissionField?._id?.toString(),
          )?.response;
          if (actionPermissionId) {
            actionPermissionsIds.push(actionPermissionId);
          }
        }
      });
    });

    if (!(actionPermissionsIds?.length > 0)) throw new Error(`actionPermissionsIds not found`);

    const actionTypeField = getFieldByLabel(
      systemForms.actionPermissions.fields.actionType,
      actionPermissionsForm?.fields,
    );
    if (!actionTypeField?._id) throw new Error(`actionTypeField not found`);

    const actionPermissionResponses = await ResponseModel.find({
      formId: actionPermissionsForm?._id,
      _id: { $in: actionPermissionsIds },
      'values.field': actionTypeField?._id,
      'values.value': actionType,
    }).lean();

    const conditionTypeField = getFieldByLabel(
      systemForms.actionPermissions.fields.conditionType,
      actionPermissionsForm?.fields,
    );
    if (!conditionTypeField?._id) throw new Error(`conditionTypeField not found`);

    const conditionField = getFieldByLabel(
      systemForms.actionPermissions.fields.condition,
      actionPermissionsForm?.fields,
    );
    if (!conditionField?._id) throw new Error(`conditionField not found`);

    let conditions: ICondition[][] = [];
    let isConditionTypeAll = false;
    actionPermissionResponses?.forEach((actionPermission) => {
      const conditionType = actionPermission?.values?.find(
        (v) => v?.field?.toString() === conditionTypeField?._id?.toString(),
      )?.value;
      if (conditionType === 'All') {
        isConditionTypeAll = true;
      } else {
        const tempConditions = actionPermission?.values?.find(
          (v) => v?.field?.toString() === conditionField?._id?.toString(),
        )?.options?.conditions;
        if (tempConditions?.length > 0) {
          conditions = [...conditions, tempConditions];
        }
      }
    });

    if (isConditionTypeAll) {
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
        systemForms.roleActionCondition.slug,
        systemForms.actionPermissions.slug,
      ],
    },
  })?.lean();

  const userForm = forms?.find((form) => form?.slug === systemForms.users.slug);
  if (!userForm?._id) throw new Error('users form not found');

  const permissionsForm = forms?.find((form) => form?.slug === systemForms.permissions.slug);
  if (!permissionsForm?._id) throw new Error('permissions form not found');

  const roleActionConditionForm = forms?.find(
    (form) => form?.slug === systemForms.roleActionCondition.slug,
  );
  if (!roleActionConditionForm?._id) throw new Error('roleActionCondition form not found');

  const actionPermissionsForm = forms?.find(
    (form) => form?.slug === systemForms.actionPermissions.slug,
  );
  if (!actionPermissionsForm?._id) throw new Error('action permissions form not found');

  return { userForm, permissionsForm, roleActionConditionForm, actionPermissionsForm };
};
