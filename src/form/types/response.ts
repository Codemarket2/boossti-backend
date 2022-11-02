import { Schema } from 'mongoose';
import { IMedia, ISchema } from '../../utils/customTypes';
import { ICondition } from './form';

export interface IResponse extends ISchema {
  formId: any;
  appId: string;
  count: number;
  values: IValue[];
  parentResponseId?: Schema.Types.ObjectId | any; // for dependent relationship
}

export interface IValue {
  _id: string;
  field: string;
  value: string;
  valueNumber: number;
  valueBoolean: boolean;
  valueDate: Date;
  values: string[];
  template: Schema.Types.ObjectId;
  page: Schema.Types.ObjectId;
  response: Schema.Types.ObjectId | any; // IResponse
  form: Schema.Types.ObjectId;
  options: IValueOptions | any;
  media: IMedia[];
}

export interface IValueOptions {
  conditions: ICondition[];
}
