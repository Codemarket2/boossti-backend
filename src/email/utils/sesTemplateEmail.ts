import * as AWS from 'aws-sdk';
import { createTemplate, deleteTemplate } from './sesCreateEmailTemplate';
export const sendBulkTemplatedEmail = (data) => {
  const params = {
    Destinations: data.collection_of_email_scraped.map((c) => ({
      Destination: {
        ToAddresses: c.emails,
      },
      ReplacementTags: data.defaultTags,
      ReplacementTemplateData: JSON.stringify(
        {
          business_name: c.business_name,
          website_link: c.website_link,
          telephone: c.telephone,
          postal_code: c.postal_code,
          state: c.state,
          city: c.city,
          keyword: c.keyword[0],
          Address_line1: c.Address_line1,
        } || {},
      ),
    })),
    ConfigurationSetName: 'vivek-mongo',
    Source: 'info@boossti.com',
    Template: data.templateName,
    DefaultTags: data.defaultTags,
    DefaultTemplateData: JSON.stringify(data.defaultTemplateData || {}),
  };
  return new AWS.SES({ region: 'us-east-1' }).sendBulkTemplatedEmail(params).promise();
};

export const sendBulkEmails = async (data) => {
  const sesv2 = new AWS.SES({ apiVersion: '2019-09-27', region: 'us-east-1' });
  const templateData = {
    templateName: 'TestEmailTemplate',
    htmlPart: data.body,
    subjectPart: data.subject,
    textPart: '',
  };

  await createTemplate(templateData)
    .then((e) => console.log('template Created'))
    .catch((e) => console.error(e.message));

  // for creating ConfigurationSet
  // var configParam = {
  //   ConfigurationSet: {
  //     /* required */ Name: 'sonu-config' /* required */,
  //   },
  // };
  // sesv2.createConfigurationSet(configParam, function (err, data) {
  //   if (err) console.log(err, err.stack);
  //   // an error occurred
  //   else console.log('config', data); // successful response
  // });

  const params = {
    Destinations: data?.to?.map((email) => ({
      Destination: {
        ToAddresses: [email],
      },
      ReplacementTags: [
        {
          Name: 'user',
          Value: 'Sonu_Kumar',
        },
      ],
      ReplacementTemplateData: JSON.stringify(
        {
          Name: 'user',
          Value: 'Sonu_Kumar',
        } || {},
      ),
    })),
    // ConfigurationSetName: 'sonu-config',
    Source: data.from,
    Template: 'TestEmailTemplate',
    DefaultTags: [
      {
        Name: 'user',
        Value: 'Sonu_Kumar',
      },
    ],
    DefaultTemplateData: JSON.stringify(
      {
        Name: 'user',
        Value: 'Sonu_Kumar',
      } || {},
    ),
  };
  const sentData = await sesv2
    .sendBulkTemplatedEmail(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
      }
      // an error occurred
      else {
        console.log(data); // successful response
        return data;
      }
      return err;
    })
    .promise();
  await deleteTemplate({ templateName: 'TestEmailTemplate' })
    .then(() => console.log('Template Deleted'))
    .catch((e) => console.log(e.message));

  return sentData;
};

// const d = {
//   from: 'info@boossti.com',
//   to: ['sonu.patna0808@gmail.com', 'sonukumar.patna81800@gmail.com'],
//   body: 'This is a test body of email sending from aws sesv2',
//   subject: 'test bulk email',
// };

// deleteTemplate({ templateName: 'TestEmailTemplate' })
//   .then(() => console.log('Template Deleted'))
//   .catch((e) => console.log(e.message));
