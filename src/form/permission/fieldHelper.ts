import { IField } from '../types/form';

export const getFieldByLabel = (label: string, fields: IField[]) => {
  const field = fields?.find(
    (selectedField) => selectedField?.label?.toLowerCase() === label?.toLowerCase(),
  );
  return field;
};
