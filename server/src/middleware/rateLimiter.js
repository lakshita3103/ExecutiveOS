import rateLimit from "express-rate-limit";
import env from "../config/env.js";

/**
 * Every route in this app calls out to Gemini, which costs money and has
 * its own rate limits — so we throttle per-IP before we ever place that
 * call, rather than after wasting a request on the upstream provider.
 */
const aiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests",
    message: "You're sending requests too quickly. Please slow down and try again shortly.",
  },
});

export default aiRateLimiter;