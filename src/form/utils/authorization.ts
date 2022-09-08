interface AuthorizationPayload {
  actionType: 'CREATE' | 'VIEW' | 'EDIT' | 'DELETE';
  userId: string;
  formId: string;
}

export const authorization = ({ userId, formId }: AuthorizationPayload) => {
  //
};
