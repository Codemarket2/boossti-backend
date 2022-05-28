export const getFieldValue = (field, values) => {
  return values.find((v) => v?.field === field);
};
