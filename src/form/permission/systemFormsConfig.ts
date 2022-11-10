export const systemForms = {
  roles: {
    slug: 'roles',
    fields: {
      name: 'name',
    },
  },
  users: {
    slug: 'users',
    fields: {
      firstName: 'first name',
      lastName: 'last name',
      email: 'email',
      roles: 'roles',
    },
  },
  appUsers: {
    slug: 'app-users',
    fields: {
      user: 'user',
      roles: 'roles',
    },
  },
  permissions: {
    slug: 'permissions',
    fields: {
      form: 'form',
      roleActionCondition: 'role action condition',
      // role: 'role',
      // actionPermissions: 'Action Permissions',
    },
  },
  roleActionCondition: {
    slug: 'role-action-condition',
    fields: {
      role: 'role',
      actionPermissions: 'Action Permission',
    },
  },
  actionPermissions: {
    slug: 'action-permissions',
    fields: {
      actionType: 'action type',
      conditionType: 'condition type',
      condition: 'condition',
    },
  },
  feed: {
    slug: 'feed',
    fields: {
      message: 'message',
      link: 'link',
      status: 'status',
      receiver: 'receiver',
    },
  },
  activityLogCard: {
    formId: '63686d8320fac17631f16588',
    slug: 'activity-log-card',
    fields: {
      action: 'Action',
      model: 'Model',
      difference: 'Difference',
      message: 'Message',
      documentId: 'Document ID',
    },
  },
  model: {
    slug: 'model',
    fields: {
      name: 'name',
    },
  },
  userActionTypes: {
    slug: 'form-user-action-types',
    fields: {
      name: 'name',
    },
  },
};

export interface ISystemForms {
  [key: string]: ISystemForm;
}

export interface ISystemForm {
  slug: string;
  fields: {
    [key: string]: string;
  };
}
