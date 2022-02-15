import * as fs from 'fs';
import { User } from '../src/user/utils/userModel';
import { db } from './db';

const importUsersFromFile = async () => {
  let users: any = fs.readFileSync('data-migration/users.json');
  users = JSON.parse(users);
  await User.deleteMany();
  const newUsers = await User.create(users);
  console.log(`All users imported ${process.argv[2]}`);
};

(async () => {
  try {
    if (process.argv[2] === 'prod-master-boossti') {
      console.log("You can't do this");
      process.exit();
    }
    await db();
    // Run your function here
    // await importUsersFromFile();
    process.exit();
  } catch (error) {
    console.log('Error', error);
    process.exit();
  }
})();
