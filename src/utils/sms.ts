import * as AWS from 'aws-sdk';

const { SNS_ORIGINAL_NUMBER = '' } = process.env;

const sns = new AWS.SNS({ region: 'us-east-1', apiVersion: '2010-03-31' });

interface Payload {
  phoneNumber: string;
  body: string;
}

export const sendSms = (payload: Payload) => {
  let params: any = {
    Message: payload.body,
    PhoneNumber: payload.phoneNumber,
  };
  if (payload.phoneNumber.includes('+1') && SNS_ORIGINAL_NUMBER) {
    params = {
      ...params,
      MessageAttributes: {
        ['AWS.SNS.SMS.OriginationNumber']: {
          DataType: 'String',
          StringValue: SNS_ORIGINAL_NUMBER,
        },
      },
    };
  }
  return sns.publish(params).promise();
};
