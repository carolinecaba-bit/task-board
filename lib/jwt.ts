import jwt from "jsonwebtoken";

/**
 * JWT helpers for the session cookie.
 *
 * The secret MUST be set in production (`JWT_SECRET` env var). The fallback
 * below only exists so `npm run dev` works out of the box for this exercise;
 * it is intentionally obvious that it is not a real secret.
 */
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";
const JWT_EXPIRES_IN = "7d";

export const AUTH_COOKIE_NAME = "session";

export type SessionPayload = {
  sub: string; // user id
};

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "object" && decoded && "sub" in decoded) {
      return decoded as SessionPayload;
    }
    return null;
  } catch {
    return null;
  }
}
