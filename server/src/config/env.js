import "dotenv/config";
import crypto from "node:crypto";

function parseIntSafe(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseOrigins(value) {
  if (!value) {
    return ["http://localhost:5173", "http://127.0.0.1:5173"];
  }
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseIntSafe(process.env.PORT, 3001),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
  GEMINI_TIMEOUT_MS: parseIntSafe(process.env.GEMINI_TIMEOUT_MS, 30000),
  ALLOWED_ORIGINS: parseOrigins(process.env.ALLOWED_ORIGINS),
  RATE_LIMIT_MAX: parseIntSafe(process.env.RATE_LIMIT_MAX, 60),
  RATE_LIMIT_WINDOW_MS: parseIntSafe(process.env.RATE_LIMIT_WINDOW_MS, 60000),
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/executiveos",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "30d",
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",
};

export function assertRequiredEnv() {
  const missing = [];

  if (!env.GEMINI_API_KEY) missing.push("GEMINI_API_KEY");
  if (!env.JWT_SECRET) missing.push("JWT_SECRET");

  if (missing.length > 0) {
    const message = `Missing required environment variable(s): ${missing.join(
      ", "
    )}. Copy .env.example to .env and fill them in.`;

    if (env.NODE_ENV === "production") {
      throw new Error(message);
    }

    // In development we warn instead of crashing so the rest of the app
    // (health check, static routes, etc.) is still reachable while the
    // key is being set up. Every Gemini-backed route will fail fast with
    // a clear 503 until the key is present.
    // eslint-disable-next-line no-console
    console.warn(`⚠️  ${message}`);
  }

  // Dev-only convenience: a missing JWT secret would otherwise break every
  // login attempt during local setup. Generate a throwaway one so the app
  // is usable immediately — it just means existing sessions won't survive
  // a server restart until a real JWT_SECRET is set in .env.
  if (!env.JWT_SECRET && env.NODE_ENV !== "production") {
    env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
    // eslint-disable-next-line no-console
    console.warn(
      "⚠️  JWT_SECRET not set — using a temporary one for this run only. Set JWT_SECRET in .env before deploying."
    );
  }
}

export default env;