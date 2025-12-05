import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

let mongo: MongoMemoryServer | null = null;

jest.mock('../nats/nats-wrapper')

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks()
  const collections = await mongoose.connection.db?.collections();

  if (!collections) return;

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();

  // Close mongoose connection cleanly
  await mongoose.disconnect();

  await mongo?.stop();
  mongo = null;

  await mongoose.connection.close();
});
