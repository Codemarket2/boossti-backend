import * as AWS from 'aws-sdk';
import slugify from 'slugify';
import { getCreateDistributionPayload } from '../../distributions/distribution';
import { createRecord } from './route53';

const cloudfront = new AWS.CloudFront({ region: 'us-east-1', apiVersion: '2020-05-31' });

const boosstiMasterDistributionId = 'E1ZM0L2I3H19C8'; //vivek

export const deleteDistribution = async (distributionId) => {
  const dis = await getDistributionConfig(distributionId);
  const updatePayload: any = {
    DistributionConfig: { ...dis.DistributionConfig, Enabled: false },
  };
  updatePayload.IfMatch = dis.ETag;
  updatePayload.Id = distributionId;
  delete updatePayload.ETag;
  const updateRes = await updateDistribution(updatePayload);
  const params = {
    Id: distributionId,
    IfMatch: dis.ETag,
  };
  const deleteRes = cloudfront.deleteDistribution(params).promise();
  return deleteRes;
};

export const updateDistribution = (payload) => {
  return cloudfront.updateDistribution(payload).promise();
};

export const createDistribution = async (accountName: string) => {
  const domainName = slugify(accountName, { lower: true });
  const res = await getDistributionConfig(boosstiMasterDistributionId);
  const lambdaFunctionARN =
    res.DistributionConfig?.DefaultCacheBehavior.LambdaFunctionAssociations?.Items?.[0]
      ?.LambdaFunctionARN;
  const payload = getCreateDistributionPayload(domainName, lambdaFunctionARN);
  const createResponse = await cloudfront.createDistribution(payload).promise();
  await createRecord(domainName, createResponse.Distribution?.DomainName);
  return createResponse;
};

export const getDistributionConfig = (distributionId: string) => {
  const params = {
    Id: distributionId,
  };
  return cloudfront.getDistributionConfig(params).promise();
};

export const updateDistributionLambdaVersion = async (distributionId) => {
  const res = await getDistributionConfig(boosstiMasterDistributionId);
  const payload: any = { ...res };
  payload.IfMatch = res.ETag;
  payload.Id = distributionId;
  delete payload.ETag;
  const updateRes = await updateDistribution(payload);
  return updateRes;
};
