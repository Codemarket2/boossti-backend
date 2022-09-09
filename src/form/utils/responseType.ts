import { Schema } from 'mongoose';
import { IMedia, ISchema } from '../../utils/customTypes';

export interface IResponse extends ISchema {
  formId: any;
  appId: string;
  installId: string;
  count: number;
  values: IValue[];
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
  response: Schema.Types.ObjectId | any;
  form: Schema.Types.ObjectId;
  options: any;
  media: IMedia[];
}
