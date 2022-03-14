import * as AWS from 'aws-sdk';

AWS.config.apiVersions = {
  sesv2: '2019-09-27',
};

const sesv2 = new AWS.SESV2({ region: 'us-east-1' });

interface IProps {
  from: string;
  to: string[];
  body: string;
  subject: string;
}

export const sendOneByOneEmail = (payload: IProps) => {
  const params = {
    Destination: {
      // BccAddresses: [],
      // CcAddresses: ['recipient3@example.com'],
      ToAddresses: payload.to,
    },
    ConfigurationSetName: 'emailRules',
    Content: {
      Simple: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: payload.body,
          },
          // Text: {
          //   Charset: 'UTF-8',
          //   Data: 'This is the message body in text format.',
          // },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: payload.subject,
        },
      },
      // Template: {
      //   TemplateName: 'TestEmailTemplate',
      // },
    },
    // ReplyToAddresses: [],
    // ReturnPath: '',
    // ReturnPathArn: '',
    FromEmailAddress: payload.from,
    // SourceArn: '',
  };
  return sesv2.sendEmail(params).promise();
};
