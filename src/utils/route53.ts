import * as AWS from 'aws-sdk';

const route53 = new AWS.Route53({ region: 'us-east-1', apiVersion: '2013-04-01' });

const hostedZoneId = 'Z073722310U42NI3TL3V9';

export const createRecord = (subDomain, cloudfrontUrl) => {
  const params = {
    ChangeBatch: {
      Changes: [
        {
          Action: 'CREATE',
          ResourceRecordSet: {
            AliasTarget: {
              DNSName: cloudfrontUrl,
              EvaluateTargetHealth: false,
              HostedZoneId: 'Z2FDTNDATAQYW2',
            },
            Name: `${subDomain}.boossti.com`,
            Type: 'A',
          },
        },
      ],
      Comment: `Subdomain for ${subDomain} account`,
    },
    HostedZoneId: hostedZoneId,
  };
  return route53.changeResourceRecordSets(params).promise();
};

export const deleteRecord = (subDomain, cloudfrontUrl) => {
  const params = {
    ChangeBatch: {
      Changes: [
        {
          Action: 'DELETE',
          ResourceRecordSet: {
            AliasTarget: {
              DNSName: cloudfrontUrl,
              EvaluateTargetHealth: false,
              HostedZoneId: 'Z2FDTNDATAQYW2',
            },
            Name: `${subDomain}.boossti.com`,
            Type: 'A',
          },
        },
      ],
      // Comment: `Subdomain for ${subDomain} account`,
    },
    HostedZoneId: hostedZoneId,
  };
  return route53.changeResourceRecordSets(params).promise();
};

export const getRecords = (subDomain) => {
  const params = {
    HostedZoneId: hostedZoneId,
    // MaxItems: 'STRING_VALUE',
    // StartRecordIdentifier: 'STRING_VALUE',
    StartRecordName: `${subDomain}.boossti.com`,
    StartRecordType: 'A',
  };
  return route53.listResourceRecordSets(params).promise();
};
