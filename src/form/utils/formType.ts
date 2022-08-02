import { ISchema } from '../../utils/customTypes';

export interface IFieldOptions {
  default: boolean;
  selectItem: boolean;
  required: boolean;
  multipleValues: boolean;
  unique: boolean;
  caseInsensitiveUnique: boolean;
  staticText: string;
  formField: string;
  showCommentBox: boolean;
  showStarRating: boolean;
  notEditable: boolean;
  systemCalculatedAndSaved: boolean;
  systemValue: any;
  systemCalculatedAndView: boolean;
  showAsCheckbox: boolean;
  selectAllowCreate: boolean;
  selectOptions: string[];
}

export interface IForm extends ISchema {
  name: string;
  slug: string;
  fields: [IField];
  settings: any;
  published: boolean;
}

export interface IField {
  _id: string;
  label: string;
  fieldType: string;
  template: any;
  form: any;
  options: IFieldOptions;
}
