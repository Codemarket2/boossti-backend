import axios from 'axios';
import gql from 'graphql-tag';
// import graphql from 'graphql';
import { sendPushNotification } from '../../utils/onesignal';
import { NotificationModel } from './notificationSchema';
import { User } from '../../user/utils/userModel';
import { sendEmail } from '../../utils/email';

const notificationMutation = gql`
  mutation MyMutation(
    $userId: ID!
    $title: String!
    $description: String
    $link: String
    $formId: ID
    $threadId: ID
    $parentId: ID
  ) {
    sendNotification(
      userId: $userId
      title: $title
      description: $description
      link: $link
      formId: $formId
      threadId: $threadId
      parentId: $parentId
    ) {
      userId
      title
      description
      link
      formId
      threadId
      parentId
      isClicked
    }
  }
`;

const { GRAPHQL_API_URL = '', GRAPHQL_API_KEY = '', SENDER_EMAIL = '' } = process.env;

type payload = {
  userIds: string[];
  title: string;
  description?: string;
  link?: string;
  formId?: string;
  parentId?: string;
  threadId?: string;
};

export const sendNotification = async (payload: payload) => {
  try {
    if (GRAPHQL_API_URL && GRAPHQL_API_KEY) {
      const payloadArray = payload?.userIds?.map((uid) => ({
        ...payload,
        userId: uid,
      }));
      await Promise.all(
        payloadArray.map(async (p) => {
          return axios({
            url: GRAPHQL_API_URL,
            method: 'post',
            headers: {
              'x-api-key': GRAPHQL_API_KEY,
            },
            data: {
              query: notificationMutation,
              variables: p,
            },
          });
        }),
      );
      await NotificationModel.create(payloadArray);
    }
    // const user = await User.findById(payload.userId);
    const users = await User.find({ _id: { $in: payload.userIds } });
    await emailNotification(payload, users);
    // await mobileNotification(payload, user);
    // await pushNotification(payload, users);
  } catch (error) {
    console.error(error.message);
  }
};

// const mobileNotification = async (payload: payload, users: any) => {
//   const messageBody = `
//       Dear ${user.name},

//       ${payload.description}.
//     `;
//   const mobilePayload = {
//     to: user.mobile,
//     from: '+16673032366',
//     body: messageBody,
//   };
//   try {
//     const messageLog = await sendMessage(mobilePayload);
//     console.log('messageLog', messageLog);
//     // we need to save the message log to our database
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const pushNotification = async (payload: payload, users: any) => {
  const uids = users?.map((u) => `${u._id}`);
  const pushPayload = {
    title: payload.title,
    message: payload.description,
    userIds: uids,
  };
  try {
    await sendPushNotification(pushPayload);
  } catch (error) {
    console.log(error.message);
  }
};

const emailNotification = async (payload: payload, users: any) => {
  try {
    const toArray = users?.map((u) => u.email);
    const emailBody = `
      Dear User, 
    
      ${payload.description}.
       <a href='https://boossti.com${payload?.link || '/'}'><button> View </button></a> 
    `;

    const emailPayload = {
      from: SENDER_EMAIL,
      to: toArray,
      body: emailBody,
      subject: `New Response on ${payload.title}`,
    };

    if (emailPayload?.to) {
      await sendEmail(emailPayload);
    }
  } catch (error) {
    console.log('Error while sending email', error.message);
  }
};
