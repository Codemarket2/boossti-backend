import axios from 'axios';
import gql from 'graphql-tag';
import graphql from 'graphql';
import { sendPushNotification } from '../../utils/onesignal';
import { NotificationModel } from './notificationSchema';
import { User } from '../../user/utils/userModel';
import { sendEmail } from '../../utils/email';
import { sendMessage } from '../../utils/message';

const notificationMuattion = gql`
  mutation MyMutation($userId: ID!, $title: String!, $description: String, $link: String) {
    sendNotification(userId: $userId, title: $title, description: $description, link: $link) {
      userId
      title
      description
      link
      formId
      parentId
      isClicked
    }
  }
`;

const { GRAPHQL_API_URL = '', GRAPHQL_API_KEY = '', SENDER_EMAIL = '' } = process.env;

type payload = {
  userId: string;
  title: string;
  description?: string;
  link?: string;
  formId?: string;
  parentId?: string;
};

export const sendNotification = async (payload: payload) => {
  if (GRAPHQL_API_URL && GRAPHQL_API_KEY) {
    await axios({
      url: GRAPHQL_API_URL,
      method: 'post',
      headers: {
        'x-api-key': GRAPHQL_API_KEY,
      },
      data: {
        query: graphql.print(notificationMuattion),
        variables: payload,
      },
    });
    try {
      const notification = await NotificationModel.create(payload);
      const user = await User.findById(payload.userId);
      // await emailNotification(payload, user);
      // await mobileNotification(payload, user);
      // await pushNotification(payload);
    } catch (error) {
      console.error(error.message);
    }
  }
};

const mobileNotification = async (payload: payload, user: any) => {
  const messageBody = `
      Dear ${user.name},
    
      ${payload.description}.
    `;
  const mobilePayload = {
    to: user.mobile,
    from: '+16673032366',
    body: messageBody,
  };
  try {
    const messageLog = await sendMessage(mobilePayload);
    console.log('messageLog', messageLog);
    // we need to save the message log to our database
  } catch (error) {
    console.log(error.message);
  }
};
const pushNotification = async (payload: payload) => {
  const pushPayload = {
    title: payload.title,
    message: payload.description,
    userIds: [`${payload.userId}`],
  };
  try {
    await sendPushNotification(pushPayload);
  } catch (error) {
    console.log(error.message);
  }
};
const emailNotification = async (payload: payload, user: any) => {
  const emailBody = `
      Dear ${user.name}, 
    
      ${payload.description}.
       <a href='https://boossti.com${payload.link}'><button> View </button></a> 
    `;

  const emailPayload = {
    from: SENDER_EMAIL,
    to: [user.email],
    body: emailBody,
    subject: `New Response on ${payload.title}`,
  };

  user.email &&
    sendEmail(emailPayload)
      .then(() => console.log('Email Send!'))
      .catch((e) => console.log(e.message));
};
