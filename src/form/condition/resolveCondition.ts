import { ICondition } from '../types/form';
import { IResponse } from '../types/response';
import { IUserAttributes } from '../utils/actionHelper';
import { getConditionFormsAndResponses } from './getConditionForm';
import { getLeftPartValue, getRightPartValue } from './getConditionPartValue';

interface IResolveConditionPayload {
  conditions: ICondition[];
  leftPartResponse?: IResponse;
  authState: IUserAttributes;
}

export const resolveCondition = async ({
  conditions,
  leftPartResponse,
  authState,
}: IResolveConditionPayload): Promise<boolean> => {
  if (!leftPartResponse?._id) throw new Error('leftPartResponse field not found in payload');
  const { forms, responses } = await getConditionFormsAndResponses(conditions);
  const tempResult: boolean[] = [];

  for (const condition of conditions) {
    const leftValue = await getLeftPartValue({
      conditionPart: condition?.left,
      forms,
      response: leftPartResponse,
    });
    const rightValue = getRightPartValue({
      conditionPart: condition?.right,
      forms,
      responses,
      authState: authState,
    });

    let conditionResult = false;
    if (leftValue || rightValue) {
      if (condition?.conditionType === '==') {
        conditionResult = leftValue === rightValue;
      } else if (condition?.conditionType === '!=') {
        conditionResult = leftValue !== rightValue;
      }
    }
    tempResult.push(conditionResult);
  }

  if (conditions?.[1]?.operator === 'OR') {
    return tempResult?.some((r) => r);
  }
  return !tempResult?.some((r) => !r);
};
