import env from "../config/env.js";
import logger from "../utils/logger.js";
import AppError from "../utils/AppError.js";

// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
  // Translate common Mongoose/MongoDB error shapes into the same
  // operational-error contract the rest of the app uses, so callers get
  // a clear 4xx instead of a raw 500 for things like a race-condition
  // duplicate email or a malformed id in a URL.
  if (err.code === 11000) {
    err = new AppError("An account with this email already exists.", 409);
  } else if (err.name === "ValidationError") {
    err = new AppError(err.message, 400);
  } else if (err.name === "CastError") {
    err = new AppError("Invalid request.", 400);
  }

  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  const isOperational = Boolean(err.isOperational);

  logger.error("Request failed", {
    requestId: req.id,
    path: req.originalUrl,
    method: req.method,
    statusCode,
    message: err.message,
    stack: env.NODE_ENV === "production" ? undefined : err.stack,
  });

  if (err.payload) {
    return res.status(statusCode).json(err.payload);
  }

  const message =
    isOperational && err.expose !== false
      ? err.message
      : "Something went wrong. Please try again.";

  return res.status(statusCode).json({
    error: isOperational ? err.message : "Internal server error",
    message,
  });
}