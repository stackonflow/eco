import mongoose from "mongoose";
import { logger } from "../lib/logger";

export async function connectMongo(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required to start the EcoCycle API.");
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10_000,
  });
  logger.info("Connected to MongoDB");
}
