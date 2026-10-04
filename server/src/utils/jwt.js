import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const SESSION_COOKIE = "exos_session";

export function signSession(userId) {
  return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifySession(token) {
  const payload = jwt.verify(token, env.JWT_SECRET);
  return payload.sub;
}

// Centralized so the cookie is always set/cleared with the exact same
// attributes — a mismatch (e.g. different `path`) is a classic way a
// "clear cookie" call silently fails to actually clear it.
export function cookieOptions() {
  // Cross-domain deployments (frontend on one domain, API on another)
  // require SameSite=None, which browsers only honor when Secure is also
  // true (HTTPS). Locally, frontend and backend share "localhost" as
  // their site even on different ports, so Lax still works there.
  const crossSite = env.COOKIE_SECURE;
  return {
    httpOnly: true,
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite,
    path: "/",
  };
}

export default { signSession, verifySession, cookieOptions, SESSION_COOKIE };