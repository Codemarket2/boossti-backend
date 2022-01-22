export const notificationResolvers = {
  'Mutation sendNotification': 'notificationLambda',
  'Mutation callNotification': 'notificationLambda',
  'Mutation setIsClicked': 'notificationLambda',
  'Query getMyNotifications': 'notificationLambda',
  'Query getNotificationList': 'notificationLambda',
};
