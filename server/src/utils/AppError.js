/**
 * An operational error we threw on purpose (bad input, upstream failure,
 * etc.) as opposed to a bug. The error handler uses `statusCode` and
 * `expose` to decide what to send back to the client.
 */
export default class AppError extends Error {
  constructor(
    message,
    statusCode = 500,
    { expose = true, cause, payload } = {}
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.expose = expose;
    this.isOperational = true;
    // Optional: lets a route define the exact JSON body to send back,
    // so each endpoint can keep its own established error shape instead
    // of one generic { error, message } for everything.
    this.payload = payload;
    if (cause) this.cause = cause;
  }
}