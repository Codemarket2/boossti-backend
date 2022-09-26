type FieldLabelName = string;
type ResponseFieldProp = string;

interface IUserFormConfig {
  slug: string;
  fields: {
    [field: ResponseFieldProp]: FieldLabelName;
  };
}

export const UserFormConfig = {
  slug: 'users',
  fields: {
    emailVerified: 'Email verified',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    roles: 'roles',
    picture: 'Picture',
    status: 'Status',
    address: 'Address',
  },
};
