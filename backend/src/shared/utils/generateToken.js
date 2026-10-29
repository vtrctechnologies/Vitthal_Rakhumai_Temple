import jwt from "jsonwebtoken";

/**
 * Validates and retrieves the JWT secret.
 * Throws a fatal error if JWT_SECRET is missing, empty, or shorter than 32 characters.
 */
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== "string" || secret.trim().length < 32) {
    throw new Error(
      "FATAL: JWT_SECRET environment variable is missing or insecure. It must contain at least 32 characters."
    );
  }
  return secret.trim();
};

const generateToken = (id) => {
  const secret = getJwtSecret();
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export default generateToken;
