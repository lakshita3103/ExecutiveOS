import env, { assertRequiredEnv } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import createApp from "./app.js";
import logger from "./utils/logger.js";

assertRequiredEnv();

const app = createApp();

let server;

async function start() {
  try {
    await connectDB();
  } catch (error) {
    logger.error("Failed to connect to MongoDB — server not started", {
      message: error.message,
    });
    process.exit(1);
  }

  server = app.listen(env.PORT, () => {
    logger.info(`ExecutiveOS AI server running on port ${env.PORT}`, {
      env: env.NODE_ENV,
      model: env.GEMINI_MODEL,
    });
  });
}

start();

function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`);
  if (!server) {
    process.exit(0);
    return;
  }
  server.close(async () => {
    await disconnectDB();
    logger.info("Server closed");
    process.exit(0);
  });

  // Force-exit if connections don't drain in time.
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason: String(reason) });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { message: error.message, stack: error.stack });
  process.exit(1);
});