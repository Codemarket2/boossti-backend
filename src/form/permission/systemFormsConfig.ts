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
      role: 'role',
      actionPermissions: 'Action Permissions',
    },
  },
};
