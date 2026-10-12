import "dotenv/config";
import * as bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectMongo } from "../config/database";
import { logger } from "../lib/logger";
import { User } from "../models/user";

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "EcoCycle Admin";

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding an admin.");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  await connectMongo();
  const existingUser = await User.findOne({ email }).select("_id").lean();
  if (existingUser) {
    throw new Error("That email already has an account; the seed will not change its role.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ name, email, passwordHash, role: "admin" });
  logger.info({ email }, "First EcoCycle administrator created");
}

seedAdmin()
  .catch((error: unknown) => {
    logger.error({ err: error }, "Admin seed failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
