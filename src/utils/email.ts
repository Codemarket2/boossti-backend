import * as AWS from 'aws-sdk';

AWS.config.apiVersions = {
  ses: '2010-12-01',
};

const ses = new AWS.SES({ region: 'us-east-1' });

interface IProps {
  from: string;
  to: string[];
  body: string;
  subject: string;
}

export const sendEmail = (payload: IProps) => {
  const params = {
    Destination: {
      // BccAddresses: [],
      // CcAddresses: ['recipient3@example.com'],
      ToAddresses: payload.to,
    },
    Message: {
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
    // ReplyToAddresses: [],
    // ReturnPath: '',
    // ReturnPathArn: '',
    Source: payload.from,
    // SourceArn: '',
  };
  return ses.sendEmail(params).promise();
};
