import { getFormIds, getFormsByIds } from '../condition/getConditionForm';
import { getLeftPartValue } from '../condition/getConditionPartValue';

export const getActionVariableValues2 = async (action, response) => {
  const variableValues = {};

  for (const variable of action?.variables) {
    let value = '';
    try {
      if (variable?.field) {
        const formIds = getFormIds(variable?.field);
        const forms = await getFormsByIds(formIds);
        value = await getLeftPartValue({ conditionPart: variable?.field, response, forms });
      }
    } catch (error) {
      console.log('Error while getting variable value, getActionVariableValues2', error);
    }
    variableValues[variable?.name] = value;
  }
  return variableValues;
};

interface ReplaceVariableValue2Payload {
  text: string;
  variableValues: any;
}
export const replaceVariableValue2 = ({ text, variableValues }: ReplaceVariableValue2Payload) => {
  let newText = text || '';
  Object.keys(variableValues)?.forEach((key) => {
    newText = newText?.split(`{{${key}}}`).join(variableValues?.[key] || '');
  });
  return newText;
};
