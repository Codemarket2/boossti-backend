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
          console.log(data);
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
