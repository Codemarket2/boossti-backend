import * as AWS from 'aws-sdk';

const pinpoint = new AWS.Pinpoint({ region: 'us-east-1' });

interface Payload {
  phoneNumber: string;
  body: string;
}

export const sendSms = (payload: Payload) => {
  const params = {
    ApplicationId: 'e5f40d45fb424afa8dc402b9d31cff29',
    MessageRequest: {
      Addresses: {
        [payload.phoneNumber]: {
          ChannelType: 'SMS',
        },
      },
      MessageConfiguration: {
        SMSMessage: {
          Body: payload.body,
          MessageType: 'TRANSACTIONAL',
        },
      },
    },
  };
  return pinpoint.sendMessages(params).promise();
};
