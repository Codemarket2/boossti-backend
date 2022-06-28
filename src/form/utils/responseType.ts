import { IMedia, ISchema } from '../../utils/cutomTypes';

export interface IResponse extends ISchema {
  formId: any;
  count: number;
  templates: ITemplate[];
  values: IValue[];
}

export interface ITemplate extends ISchema {
  template: string;
  user: string;
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
  page: string;
  response: string;
  form: string;
  options: any;
  media: IMedia[];
}
