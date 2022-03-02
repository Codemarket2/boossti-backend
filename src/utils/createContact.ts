import * as AWS from 'aws-sdk';

AWS.config.apiVersions = {
  sesv2: '2019-09-27',
};

const sesv2 = new AWS.SESV2({ region: 'us-east-1' });

enum pref {
  OPT_IN,
  OPT_OUT,
}
interface IContactProps {
  ContactListName: string;
  EmailAddress: string;
  AttributesData: string;
  TopicPreferences: {
    SubscriptionStatus: pref;
    TopicName: string;
  };
  UnsubscribeAll: boolean;
}
interface IContactListProps {
  ContactListName: string;
  Description: string;
  Tags: {
    Key: string;
    Value: string;
  };
  Topics: {
    DefaultSubscriptionStatus: pref /* required */;
    DisplayName: string /* required */;
    TopicName: string /* required */;
    Description: string;
  };
}

const createContactList = async () => {
  var params = {
    ContactListName: 'MERN' /* required */,
    Description: 'This is MERN contact list',
    Tags: [
      {
        Key: 'devType' /* required */,
        Value: 'MERN' /* required */,
      },
      /* more items */
    ],
    Topics: [
      {
        DefaultSubscriptionStatus: 'OPT_IN' /* required */,
        DisplayName: 'MERN List' /* required */,
        TopicName: 'Developer' /* required */,
        Description: 'MERN Developer Default List',
      },
    ],
  };
  sesv2.createContactList(params, function (err, data) {
    if (err) console.log(err, err.stack);
    // an error occurred
    else console.log(data); // successful response
  });
};

const createContact = async () => {
  const params = {
    ContactListName: 'default' /* required */,
    EmailAddress: 'sonu.patna0808@gmail.com' /* required */,
    AttributesData: 'Test_Attributes',
    TopicPreferences: [
      {
        SubscriptionStatus: 'OPT_IN' /* required */,
        TopicName: 'Developer' /* required */,
      },
      /* more items */
    ],
    UnsubscribeAll: false,
  };
  sesv2.createContact(params, function (err, data) {
    if (err) console.log(err, err.stack);
    // an error occurred
    else console.log(data); // successful response
  });
};
// sesv2.getContact(
//   {
//     ContactListName: 'default' /* required */,
//     EmailAddress: 'sonu.patna0808@gmail.com' /* required */,
//   },
//   (err, data) => {
//     err && console.log(err);
//     !err && console.log(data);
//   },
// );
createContactList();
// createContact();
