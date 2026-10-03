/**
 * Validates req.body against a zod schema, replacing it with the parsed
 * (and defaulted/coerced) value on success. On failure, delegates to a
 * route-supplied formatter so each endpoint can keep its original error
 * response shape, or falls back to a generic 400.
 */
export default function validateBody(schema, formatError) {
  return function validator(req, res, next) {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message =
        result.error.errors?.[0]?.message || "Invalid request body.";

      if (typeof formatError === "function") {
        return res.status(400).json(formatError(message));
      }

      return res.status(400).json({ error: message });
    }

    req.body = result.data;
    return next();
  };
}