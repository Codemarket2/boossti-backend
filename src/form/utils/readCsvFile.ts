// const AWS = require('aws-sdk');

import * as AWS from 'aws-sdk';
import * as csv from '@fast-csv/parse';

const S3 = new AWS.S3();
export const fileParser = async (fileUrl, filter) => {
  const splitUrl = fileUrl.split('.s3.us-east-1.amazonaws.com/');
  const bucketName = splitUrl[0].split('://').pop();

  const params = {
    Bucket: bucketName,
    Key: splitUrl[1],
  };

  const csvFile = S3.getObject(params).createReadStream();
  const Data: any = [];
  const parserFcn = new Promise((resolve, reject) => {
    const parser = csv
      .parseStream(csvFile, { headers: true })
      .on('data', function (d) {
        const res: any = {};
        filter.map((fv: any) => {
          res[fv] = d[fv];
        });
        Data.push(res);
      })
      .on('end', function () {
        resolve('csv parse process finished');
      })
      .on('error', function () {
        reject('csv parse process failed');
      });
  });

  try {
    await parserFcn;
  } catch (error) {
    console.log('Get Error: ', error);
  }

  return Data;
};

//'https://vijaa-content-bucket202938-dev.s3.us-east-1.amazonaws.com/public/media/csvDataFile/text-5e770856-3272-4043-8fc9-9c42f11237881642092564326.csv
