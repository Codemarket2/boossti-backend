import * as mongoose from 'mongoose';

export const DB = async (DB_STRING?: string) => {
  try {
    if (!process.env.DATABASE) {
      throw new Error('Database connection string not found');
    }
    await mongoose.connect(DB_STRING || process.env.DATABASE, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log('DB Connection Successfull!');
  } catch (error) {
    console.log('DB Connection Failed');
    throw error;
  }
};
