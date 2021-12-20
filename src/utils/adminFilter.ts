import { IIdentity } from './cutomTypes';
export default function getAdminFilter(identity: IIdentity, user: any) {
  const filter: any = {};

  if (user && !(identity?.groups?.includes('superadmin') || identity?.groups?.includes('admin'))) {
    filter.createdBy = user._id;
  }
  return filter;
}
