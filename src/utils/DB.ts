import * as mongoose from 'mongoose';

let isConnected;

export const DB = async (DB_STRING?: string) => {
  try {
    if (isConnected) {
      console.log('=> using existing database connection');
      return;
    } else if (!process.env.DATABASE) {
      throw new Error('Database connection string not found');
    } else {
      const db = await mongoose.connect(DB_STRING || process.env.DATABASE, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      });
      isConnected = db.connections[0].readyState;
      console.log('DB Connection Successfull!');
      return;
    }
  } catch (error) {
    console.log('DB Connection Failed');
    throw error;
  }
};
