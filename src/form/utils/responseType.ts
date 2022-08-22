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
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueDate: Date | null;
  values: string[] | [];
  template: string | null;
  page: string | null;
  response: string | null;
  form: string | null;
  options: {
    options: boolean;
  };
  media: IMedia[] | [];
}
