import AppError from "../utils/AppError.js";
import { verifySession, SESSION_COOKIE } from "../utils/jwt.js";

export default function requireAuth(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];

  if (!token) {
    return next(new AppError("Not signed in.", 401));
  }

  try {
    req.userId = verifySession(token);
    return next();
  } catch {
    return next(new AppError("Your session has expired. Please log in again.", 401));
  }
}