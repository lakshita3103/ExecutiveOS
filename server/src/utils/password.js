import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

export default { hashPassword, comparePassword };