export const userSelect = '_id userId name picture';
export const userPopulate = {
  path: 'createdBy',
  select: userSelect,
};
