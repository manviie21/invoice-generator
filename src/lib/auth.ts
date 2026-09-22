import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "invoice_session";

function getSecretKey() {
  const secret =
    process.env.SESSION_SECRET ||
    "fallback_very_secure_secret_key_needs_at_least_32_chars!";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(username: string): Promise<string> {
  const token = await new SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());
  return token;
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = await verifySessionToken(token);
  return payload !== null;
}
