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
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
    path: "/",
  };
}

export default { signSession, verifySession, cookieOptions, SESSION_COOKIE };