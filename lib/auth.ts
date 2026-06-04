import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

/** True when the request carries a valid admin session cookie. */
export async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const session = (await cookies()).get("admin_session")?.value;
  if (!session) return false;

  // Constant-time comparison to avoid leaking the secret via timing.
  const a = Buffer.from(session);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Guard for API route handlers. Returns a 401 response to return early when the
 * caller is not an authenticated admin, or null when the request may proceed.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
