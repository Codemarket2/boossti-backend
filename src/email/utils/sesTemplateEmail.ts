import * as AWS from 'aws-sdk';
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
  return new AWS.SES().sendBulkTemplatedEmail(params).promise();
};
