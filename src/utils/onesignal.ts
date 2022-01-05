import * as https from 'https';

interface IPayload {
  title: string;
  message?: string;
  userIds: string[];
}

const { ONESIGNAL_APP_ID, ONESIGNAL_API_KEY } = process.env;

export const sendPushNotification = function (payload: IPayload) {
  return new Promise((resolve, reject) => {
    if (ONESIGNAL_APP_ID && ONESIGNAL_API_KEY) {
      const data = {
        app_id: ONESIGNAL_APP_ID,

        headings: { en: payload.title },
        contents: { en: payload.message },
        channel_for_external_user_ids: 'push',
        include_external_user_ids: payload.userIds,
      };
      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        host: 'onesignal.com',
        Authorization: `Basic ${ONESIGNAL_API_KEY}`, // + process.env.ONESIGNAL_API_KEY ||
      };

      const options = {
        host: 'onesignal.com',
        port: 443,
        path: '/api/v1/notifications',
        method: 'POST',
        headers: headers,
      };

      const req = https.request(options, function (res) {
        res.on('data', function (data) {
          console.log('Response:');
          console.log(JSON.parse(data));
          resolve(true);
        });
      });
      req.on('error', function (e) {
        console.log('ERROR:');
        console.log(e);
        reject(e);
      });

      req.write(JSON.stringify(data));
      req.end();
    } else reject('No App ID Provided');
  });
};

// sendPushNotification({
//   title: 'Notification From Console',
//   message:
//     "This Notification is for testing purpose and it is triggred by Developer. you don't have to worry about this notification. Have a nice day.",
//   userIds: ['61b2fc00b5a1100008288486', '61cb0b5fb2c3d30009278768', '61cc415c01e46b0008a10027'],
//   appID: 'd7a822b5-a821-460f-a60a-86d08d19e8f0',
//   apiKey: 'MmNkMGI5M2EtZTcwMC00YTcxLTlhZTUtZjZhNzA3NDI1Y2Qx',
// })
//   .then((data) => console.log({ data }))
//   .catch((e) => console.log(e));
