import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";
import { connectMongo } from "./config/database";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start(): Promise<void> {
  await connectMongo();

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

start().catch((error: unknown) => {
  logger.error({ err: error }, "API server startup failed");
  process.exit(1);
});
