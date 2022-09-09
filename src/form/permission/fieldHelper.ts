import { IField } from '../utils/formType';

export const getFieldByLabel = (label: string, fields: IField[]) => {
  const field = fields?.find(
    (selectedField) => selectedField?.label?.toLowerCase() === label?.toLowerCase(),
  );
  return field;
};
