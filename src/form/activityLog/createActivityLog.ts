import { ClientSession } from 'mongoose';
import { systemForms } from '../permission/systemFormsConfig';
import { createResponse } from '../utils/createResponse';
import { FormModel } from '../utils/formModel';
import { getSystemFormFields } from '../utils/getSystemFormFields';
import { ResponseModel } from '../utils/responseModel';

interface ICreateActivityLogPayload {
  session: ClientSession;
  model: string;
  documentId: string;
  difference: any;
  createdBy: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
}

export const createActivityLog = async ({
  model,
  documentId,
  session,
  difference,
  createdBy,
  action,
}: ICreateActivityLogPayload) => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  const activityLogForm = await FormModel.findOne({ slug: systemForms?.activityLogCard?.slug });

  if (!activityLogForm?._id) {
    throw new Error('activityLogForm not found');
  }

  const activityLogFormFields = getSystemFormFields(systemForms?.activityLogCard, activityLogForm);
  const actionField = activityLogFormFields?.[systemForms?.activityLogCard?.fields?.action];
  const modelField = activityLogFormFields?.[systemForms?.activityLogCard?.fields?.model];
  const differenceField = activityLogFormFields?.[systemForms?.activityLogCard?.fields?.difference];
  const documentIdField = activityLogFormFields?.[systemForms?.activityLogCard?.fields?.documentId];
  if (!actionField?._id || !modelField?._id || !differenceField?._id || !documentIdField?._id) {
    throw new Error(
      `actionField, modelField, differenceField, documentIdField fields not found in ${activityLogForm?.name} form`,
    );
  }
  const payload: any = { formId: activityLogForm?._id, createdBy, values: [] };
  payload.values?.push({
    field: differenceField?._id,
    value: JSON.stringify(difference),
    options: { json: difference },
  });
  payload.values?.push({ field: documentIdField?._id, value: documentId });
  const modelResponseId = await getModelResponseId(model);
  payload.values?.push({ field: modelField?._id, value: '', response: modelResponseId });
  const actionTypeResponseId = await getActionTypeResponseId(action);
  payload.values?.push({ field: actionField?._id, value: '', response: actionTypeResponseId });
  await createResponse(payload, session);
};

const getModelResponseId = async (modelName) => {
  const modelForm = await FormModel.findOne({ slug: systemForms?.model?.slug });
  if (!modelForm?._id) throw new Error('Model Form not found');
  const nameField = modelForm?.fields?.find(
    (field) => field?.label?.toLowerCase() === systemForms?.model?.fields?.name,
  );
  const modelResponse = await ResponseModel.findOne({
    formId: modelForm?._id,
    'values.field': nameField?._id,
    'values.value': modelName,
  });
  if (!modelResponse?._id) throw new Error(`"${modelName}" Model Response not found`);
  return modelResponse?._id;
};

const getActionTypeResponseId = async (actionType) => {
  const actionTypesForm = await FormModel.findOne({ slug: systemForms?.userActionTypes?.slug });
  if (!actionTypesForm?._id) throw new Error('Action Types Form not found');
  const nameField = actionTypesForm?.fields?.find(
    (field) => field?.label?.toLowerCase() === systemForms?.model?.fields?.name,
  );
  const actionTypeResponse = await ResponseModel.findOne({
    formId: actionTypesForm?._id,
    'values.field': nameField?._id,
    'values.value': actionType,
  });
  if (!actionTypeResponse?._id) throw new Error(`"${actionType}" Action Type Response not found`);
  return actionTypeResponse?._id;
};
