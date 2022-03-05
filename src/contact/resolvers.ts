export const contactResolvers = {
  'Mutation createContact': 'contactLambda',
  'Mutation updateContact': 'contactLambda',
  'Mutation deleteContact': 'contactLambda',
  'Mutation createMailingList': 'contactLambda',
  'Mutation createMailingListFromContact': 'contactLambda',
  'Query getAllContacts': 'contactLambda',
  'Query getAllMailingList': 'contactLambda',
  'Query getContact': 'contactLambda',
};
