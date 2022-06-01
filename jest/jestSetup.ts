import * as mongoose from 'mongoose';
import { ResponseModel } from '../src/form/utils/responseModel';
import { User } from '../src/user/utils/userModel';
import { createCollections } from '../src/utils/createCollections';
import { mockUser } from './defaultArguments';
import { userResponse } from './initialData';

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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

beforeAll(async () => {
  try {
    await mongoose.connect(getMongoUrl());
    await delay(1000);
    await createCollections();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
});

beforeEach(async () => {
  await User.create(mockUser);
  await ResponseModel.create(userResponse);
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
