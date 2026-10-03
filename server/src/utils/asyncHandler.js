/**
 * Wraps an async Express handler so thrown errors / rejected promises are
 * forwarded to next(err) instead of crashing the process or hanging the
 * request.
 */
export default function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}