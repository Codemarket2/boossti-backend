import * as fs from 'fs';
import { User } from '../src/user/utils/userModel';
import { DB } from './db';

const importUsersFromFile = async () => {
  let users: any = fs.readFileSync('data-migration/users.json');
  users = JSON.parse(users);
  await User.deleteMany();
  const newUsers = await User.create(users);
  console.log(`All users imported ${process.argv[2]}`);
};

(async () => {
  try {
    if (process.argv[2] === 'prod-master-vijaa') {
      console.log("You can't do this");
      process.exit();
    }
    await DB();
    // Run your function here
    // await importUsersFromFile();
    process.exit();
  } catch (error) {
    console.log('Error', error);
    process.exit();
  }
})();
