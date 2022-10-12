import { ResponseModel } from '../utils/responseModel';
import { getSystemForms } from './authorization';
import { getFieldByLabel } from './fieldHelper';
import { getUserRoleIds } from './getUserRoleIds';
import { systemForms } from './systemFormsConfig';

interface FormAuthorizationPayload {
  user: any;
}

export async function formAuthorization({ user }: FormAuthorizationPayload) {
  const formIds: string[] = [];
  if (process?.env?.NODE_ENV === 'test') {
    return { formIds, isSuperAdmin: true };
  }
  const { userForm, permissionsForm, roleActionConditionForm } = await getSystemForms();
  const { isSuperAdmin, userRoleIds } = await getUserRoleIds({ user, userForm });

  const roleField = getFieldByLabel(
    systemForms.roleActionCondition.fields.role,
    roleActionConditionForm?.fields,
  );
  if (!roleField?._id) throw new Error('Role field not found in role action condition form');

  const roleActionConditionResponses = await ResponseModel.find({
    formId: roleActionConditionForm?._id,
    'values.field': roleField?._id,
    'values.response': { $in: userRoleIds },
  }).lean();

  const roleActionConditionIds = roleActionConditionResponses?.map((r) => r?._id);

  if (roleActionConditionIds?.length > 0) {
    const permissionFormRoleActionConditionField = getFieldByLabel(
      systemForms.permissions.fields.roleActionCondition,
      permissionsForm?.fields,
    );
    if (!permissionFormRoleActionConditionField?._id)
      throw new Error('RoleActionCondition field not found in permissions form');

    const permissionFormFormField = getFieldByLabel(
      systemForms.permissions.fields.form,
      permissionsForm?.fields,
    );
    if (!permissionFormFormField?._id)
      throw new Error('formField field not found in permissions form');

    const permissionsResponses = await ResponseModel.find({
      formId: permissionsForm?._id,
      'values.field': permissionFormRoleActionConditionField?._id,
      'values.response': { $in: roleActionConditionIds },
    }).lean();

    permissionsResponses?.forEach((res) => {
      const formFieldValue = res?.values?.find(
        (r) => r?.field?.toString() === permissionFormFormField?._id?.toString(),
      );
      if (formFieldValue?.form) {
        formIds.push(formFieldValue?.form?.toString());
      }
    });
  }

  return { isSuperAdmin, formIds };
}
