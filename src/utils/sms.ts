import * as AWS from 'aws-sdk';

const sns = new AWS.SNS({ region: 'us-east-1', apiVersion: '2010-03-31' });

interface Payload {
  phoneNumber: string;
  body: string;
}

export const sendSms = (payload: Payload) => {
  const params = {
    Message: payload.body,
    PhoneNumber: payload.phoneNumber,
  };
  return sns.publish(params).promise();
};
