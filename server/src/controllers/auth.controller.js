import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signSession, cookieOptions, SESSION_COOKIE } from "../utils/jwt.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

function setSessionCookie(res, userId) {
  const token = signSession(userId);
  res.cookie(SESSION_COOKIE, token, cookieOptions());
}

// =========================
// SIGN UP
// =========================
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash });

  // Every new account starts with a genuinely empty workspace — no demo
  // tasks/notes, and definitely nothing left over from anyone else. Since
  // this Workspace document is brand new for this user's _id, there is
  // nothing to inherit by construction.
  await Workspace.create({ user: user._id });

  setSessionCookie(res, user._id);
  res.status(201).json({ user: user.toPublicJSON() });
});

// =========================
// LOGIN
// =========================
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("No account found with this email.", 401);
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Incorrect password.", 401);
  }

  setSessionCookie(res, user._id);
  res.json({ user: user.toPublicJSON() });
});

// =========================
// LOGOUT
// =========================
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
  res.json({ success: true });
});

// =========================
// CURRENT USER
// (called on app load to restore the session, replacing the old
// "read the session out of localStorage" check)
// =========================
export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new AppError("Account not found.", 401);
  }
  res.json({ user: user.toPublicJSON() });
});

// =========================
// UPDATE PROFILE
// (name, email, avatar, and/or password)
// =========================
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, avatar, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.userId);
  if (!user) {
    throw new AppError("Account not found.", 401);
  }

  const wantsEmailChange = email !== undefined && email !== user.email;
  const wantsPasswordChange = Boolean(newPassword);

  // Changing login-relevant details is sensitive — always require the
  // current password to confirm it's really the account owner.
  if (wantsEmailChange || wantsPasswordChange) {
    if (!currentPassword) {
      throw new AppError(
        "Enter your current password to change your email or password.",
        400
      );
    }
    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError("Current password is incorrect.", 400);
    }
  }

  if (wantsEmailChange) {
    const existing = await User.findOne({ email, _id: { $ne: user._id } });
    if (existing) {
      throw new AppError("An account with this email already exists.", 409);
    }
    user.email = email;
  }

  if (name !== undefined) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  if (wantsPasswordChange) user.passwordHash = await hashPassword(newPassword);

  await user.save();

  res.json({ user: user.toPublicJSON() });
});

// =========================
// UPGRADE / DOWNGRADE PLAN
// (kept separate from updateProfile: this isn't an identity change, and
// a real payment flow would hang off these two routes later)
// =========================
export const upgradePlan = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { plan: "pro" },
    { new: true }
  );
  if (!user) throw new AppError("Account not found.", 401);
  res.json({ user: user.toPublicJSON() });
});

export const downgradePlan = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { plan: "free" },
    { new: true }
  );
  if (!user) throw new AppError("Account not found.", 401);
  res.json({ user: user.toPublicJSON() });
});

export default { signup, login, logout, me, updateProfile, upgradePlan, downgradePlan };