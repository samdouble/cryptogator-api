import mongoose from 'mongoose';

export const initializeDB = async (dbName: string, done: any) => {
  try {
    await mongoose.connect(process.env.MONGO_URL || `mongodb://127.0.0.1/${dbName}`);
    done();
  } catch (error) {
    throw new Error(`Could not connect to the database: ${error}`);
  }
};

export const closeDB = async (done: any) => {
  await mongoose.connection.db?.dropDatabase();
  await mongoose.disconnect();
  done();
};

export const emptyCollection = async (collectionName: string) => {
  const collection = mongoose.connection.db?.collection(collectionName);
  await collection?.deleteMany({});
};

export default {
  initializeDB,
  closeDB,
  emptyCollection,
};
