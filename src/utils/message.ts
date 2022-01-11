import { Twilio } from 'twilio';

const { TWILIO_ACCOUNT_SID = '', TWILIO_AUTH_TOKEN = '' } = process.env;

interface IProps {
  to: string;
  from: string;
  body: string;
}

export const sendMessage = async (payload: IProps) => {
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const { to, from, body } = payload;
    client.messages
      .create({
        to: to,
        from: from,
        body: body,
      })
      .then((message) => {
        console.log(message.sid);
        return message.sid;
      })
      .catch((e) => e);
  } else {
    console.error('You are missing one of the variables you need to send a message');
  }
};
