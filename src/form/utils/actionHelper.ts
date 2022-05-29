export const getFieldValue = (fieldId, values) => {
  return values.find((v) => v?.field === fieldId);
};
export const getFieldValueByLabel = (label, fields, values) => {
  const fieldId = fields.find((f) => f?.label?.toLowerCase() === label?.toLowerCase())?._id;
  return values.find((v) => v?.field === fieldId);
};
