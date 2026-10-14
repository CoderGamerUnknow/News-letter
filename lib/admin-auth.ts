/**
 * Admin desk authentication.
 *
 * One shared password (`ADMIN_PASSWORD`) guards the desk and its API. The
 * session cookie is an HMAC of a fixed context string keyed by that password,
 * so it is stateless (no session table), tamper-proof, and every session dies
 * the moment the password rotates. Comparisons are timing-safe.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/** Cookie that carries the admin session. */
export const COOKIE_NAME = "dl-admin";

const SESSION_CONTEXT = "daily-ledger-admin-session";
const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7;

/** True when an admin password has been configured on this server. */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** Timing-safe string comparison over SHA-256 digests (length-independent). */
function safeEqual(a: string, b: string): boolean {
  const digest = (value: string) => createHmac("sha256", "compare").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}

/** The valid session token for the configured password. */
export function sessionToken(): string {
  return createHmac("sha256", process.env.ADMIN_PASSWORD ?? "")
    .update(SESSION_CONTEXT)
    .digest("hex");
}

/** Check a submitted password against the configured one. */
export function verifyPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

/** Check a cookie value against the current session token. */
export function hasValidSession(cookieValue: string | undefined): boolean {
  if (!cookieValue || !process.env.ADMIN_PASSWORD) return false;
  return safeEqual(cookieValue, sessionToken());
}

/** Cookie attributes shared by set and clear. */
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_S,
};
