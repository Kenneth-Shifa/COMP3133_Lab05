import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer = null;

const hasAtlasConfig = () => {
  const s = process.env.DB_CONNECTION_STRING;
  const user = process.env.DB_USER_NAME;
  const pass = process.env.DB_PASSWORD;
  if (s && s.startsWith('mongodb')) return true;
  if (user && pass) return true;
  return false;
};

export const connectDB = async () => {
  if (hasAtlasConfig()) {
    const uri = process.env.DB_CONNECTION_STRING ||
      `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.${process.env.CLUSTER_ID}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;
    await mongoose.connect(uri);
    return { inMemory: false };
  }
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  return { inMemory: true };
};

export const stopInMemoryDB = async () => {
  if (mongoServer) {
    await mongoose.disconnect();
    await mongoServer.stop();
    mongoServer = null;
  }
};
