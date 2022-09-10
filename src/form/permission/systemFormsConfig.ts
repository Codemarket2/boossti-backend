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
  permissions: {
    slug: 'permissions',
    fields: {
      form: 'form',
      role: 'role',
      actionPermissions: 'Action Permissions',
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
};
