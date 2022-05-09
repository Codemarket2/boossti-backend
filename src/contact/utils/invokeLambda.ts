import * as AWS from 'aws-sdk';

const lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });

export const invokeCsvLambda = async ({
  fileUrl,
  collectionName,
  map,
  page,
  createdBy,
}: {
  fileUrl: string;
  collectionName: string;
  map: any;
  page: number;
  createdBy: string;
}) => {
  const params = {
    FunctionName: `${process.env.STAGE}-write-csv-to-mongodb` /* required */,
    InvocationType: 'Event', //| RequestResponse | DryRun,
    Payload: JSON.stringify({ fileUrl, collectionName, map, page, createdBy }),
  };
  return lambda.invoke(params).promise();
};
