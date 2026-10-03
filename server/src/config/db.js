import mongoose from "mongoose";
import env from "./env.js";
import logger from "../utils/logger.js";

mongoose.set("strictQuery", true);

export async function connectDB() {
  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error", { message: err.message });
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  await mongoose.connect(env.MONGODB_URI);
  logger.info("MongoDB connected", { uri: redact(env.MONGODB_URI) });
}

export async function disconnectDB() {
  await mongoose.disconnect();
}

// Never log a connection string with credentials in it.
function redact(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
}

export default { connectDB, disconnectDB };