import * as mongoose from 'mongoose';
import { User } from '../src/user/utils/userModel';
import { mockUser } from './defaultArguments';

jest.mock('../src/utils/DB', () => {
  const DB = () => {};
  return { DB };
});

beforeAll(async () => {
  // console.log('beforeAll');
  await mongoose.connect(
    global.__MONGO_URI__,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    }
  );
});

beforeEach(async () => {
  // await User.deleteMany({});
  await User.create(mockUser);
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});
