import moment from 'moment';

export const getValue = (field, value) => {
  switch (field?.fieldType) {
    case 'number':
    case 'phoneNumber': {
      return value.valueNumber;
    }
    case 'date': {
      return value?.valueDate && moment(value?.valueDate).format('L');
    }
    case 'dateTime': {
      return value?.valueDate && moment(value?.valueDate).format('lll');
    }
    case 'boolean': {
      return value.valueBoolean ? 'Yes' : 'No';
    }
    case 'response': {
      return getLabel(field?.options?.formField, value?.response);
    }
    // case 'select': {
    //   if (field?.options?.optionsTemplate === 'type') {
    //     return value?.itemId?.title;
    //   }
    //   if (field?.options?.optionsTemplate === 'response') {
    //     return getLabel(field?.options?.formField, value?.response);
    //   }
    //   return value?.value;
    // }
    default: {
      return value.value;
    }
  }
};

const getLabel = (formField: string, response: any): string => {
  let label = '';
  const fieldValues = response?.values?.filter((value) => value?.field === formField);
  fieldValues?.forEach((f, i) => {
    if (f?.value) {
      label += i > 0 ? `${f?.value}` : f?.value;
    }
  });
  return label;
};
