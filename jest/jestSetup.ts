import * as mongoose from 'mongoose';
import { User } from '../src/user/utils/userModel';
import { mockUser } from './defaultArguments';

jest.mock('../src/utils/DB', () => {
  const DB = () => {};
  return { DB };
});

function getMongoUrl() {
  // Replace the db name to use a unique db name for each test
  return (
    global.__MONGO_URI__.split('/').slice(0, -1).join('/') +
    `/${global.__MONGO_DB_NAME__}?retryWrites=false&w=majority`
  );
}

beforeAll(async () => {
  try {
    await mongoose.connect(getMongoUrl(), {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});

beforeEach(async () => {
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
