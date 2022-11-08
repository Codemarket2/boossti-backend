import { ClientSession } from 'mongoose';
import { systemForms } from '../permission/systemFormsConfig';
import { createResponse } from '../utils/createResponse';
import { FormModel } from '../utils/formModel';
import { getSystemFormFields } from '../utils/getSystemFormFields';

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
  const activityLogForm = await FormModel.findById(systemForms?.activityLogCard?.formId);

  if (!activityLogForm?._id) {
    throw new Error('activityLogForm not found');
  }
  const activityLogFormFields = getSystemFormFields(systemForms?.activityLogCard, activityLogForm);
  const actionField = activityLogFormFields?.[systemForms?.activityLogCard?.fields?.action];
  const modelField = activityLogFormFields?.[systemForms?.activityLogCard?.fields?.model];
  const differenceField = activityLogFormFields?.[systemForms?.activityLogCard?.fields?.difference];
  const messageField = activityLogFormFields?.[systemForms?.activityLogCard?.fields?.message];
  const documentIdField = activityLogFormFields?.[systemForms?.activityLogCard?.fields?.documentId];
  if (
    !actionField?._id ||
    !modelField?._id ||
    !differenceField?._id ||
    !messageField?._id ||
    !documentIdField?._id
  ) {
    throw new Error(
      `actionField, modelField, differenceField, messageField, documentIdField fields not found in ${activityLogForm?.name} form`,
    );
  }
  const payload: any = { formId: activityLogForm?._id, createdBy, values: [] };
  payload.values?.push({ field: actionField?._id, value: action });
  payload.values?.push({ field: modelField?._id, value: model });
  payload.values?.push({
    field: differenceField?._id,
    value: JSON.stringify(difference),
    options: { json: difference },
  });
  payload.values?.push({ field: messageField?._id, value: `${action} ${model}` });
  payload.values?.push({ field: documentIdField?._id, value: documentId });
  await createResponse(payload, session);
};
