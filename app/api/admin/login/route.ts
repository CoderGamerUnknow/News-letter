import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isAdminConfigured,
  sessionCookieOptions,
  sessionToken,
  verifyPassword,
  COOKIE_NAME,
} from "@/lib/admin-auth";

/**
 * Sign in to the admin desk with the shared password. On success a signed
 * session cookie is set; every other admin route checks it.
 */
export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not set on this server." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const password =
    typeof body === "object" && body !== null && "password" in body
      ? (body as { password?: unknown }).password
      : undefined;

  if (typeof password !== "string" || !verifyPassword(password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const store = await cookies();
  store.set(COOKIE_NAME, sessionToken(), sessionCookieOptions);

  return NextResponse.json({ ok: true });
}
