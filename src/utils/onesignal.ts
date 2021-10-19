import * as https from "https";

interface IPayload {
  title: string;
  message: string;
  userIds: string[];
}

export const sendNotification = function (payload: IPayload) {
  const data = {
    app_id: "39d662b6-c57e-4b00-bab7-df62ceaee266",
    headings: { en: payload.title },
    contents: { en: payload.message },
    channel_for_external_user_ids: "push",
    include_external_user_ids: payload.userIds,
  };
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: "Basic ZWM0OTgyYWItNDRmZi00NzAwLTgwM2ItMThmZDNhNzA1MTM2",
  };

  const options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, function (res) {
      res.setEncoding("utf8");
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        resolve(true);
      });
    });

    req.on("error", function (e) {
      reject(e);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
};
