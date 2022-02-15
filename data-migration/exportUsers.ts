import * as fs from 'fs';
import { User } from '../src/user/utils/userModel';
import { db } from './db';

const exportUsersToFile = async () => {
  const users = await User.find();
  fs.writeFileSync('data-migration/users.json', JSON.stringify(users));
  console.log('All exported to file');
};

(async () => {
  try {
    await db();
    // Run your function here
    await exportUsersToFile();
    process.exit();
  } catch (error) {
    console.log('Error', error);
    process.exit();
  }
})();
