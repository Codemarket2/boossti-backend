import * as fs from 'fs';
import { User } from '../src/user/utils/userModel';
import { DB } from './db';

const importUsersFromFile = async () => {
  let users: any = fs.readFileSync('data-migration/users.txt');
  users = JSON.parse(users);
  await User.deleteMany();
  const newUsers = await User.create(users);
  console.log('All users imported');
};

(async () => {
  try {
    await DB();
    // Run your function here
    await importUsersFromFile();
    process.exit();
  } catch (error) {
    console.log('Error', error);
    process.exit();
  }
})();
