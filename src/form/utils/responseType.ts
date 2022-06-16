import { IMedia, ISchema } from '../../utils/customTypes';

export interface IResponse extends ISchema {
  formId: any;
  parentId: string[];
  count: number;
  values: [IValue];
}

export interface IValue {
  _id: string;
  field: string;
  value: string;
  valueNumber: number;
  valueBoolean: boolean;
  valueDate: Date;
  values: string[];
  template: string;
  templateInstance: string;
  response: string;
  form: string;
  options: any;
  media: IMedia[];
}
