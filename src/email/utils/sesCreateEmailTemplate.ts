import * as AWS from 'aws-sdk';

export const createTemplate = (data) => {
  const params = {
    Template: {
      TemplateName: data.templateName,
      HtmlPart: data.htmlPart,
      SubjectPart: data.subjectPart,
      TextPart: data.textPart,
    },
  };
  return new AWS.SES().createTemplate(params).promise();
};

export const updateTemplate = (data) => {
  const params = {
    Template: {
      TemplateName: data.templateName,
      HtmlPart: data.htmlPart,
      SubjectPart: data.subjectPart,
      TextPart: data.textPart,
    },
  };
  return new AWS.SES().updateTemplate(params).promise();
};

export const deleteTemplate = (data) => {
  const params = {
    TemplateName: data.templateName,
  };
  return new AWS.SES().deleteTemplate(params).promise();
};
