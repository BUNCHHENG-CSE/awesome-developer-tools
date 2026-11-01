import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.AUTH_SECRET || "devatlas-super-secret-key-change-in-prod-32charsmin!";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export const COOKIE_NAME = "devatlas_session";

export interface SessionTokenPayload {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
}

export async function signSessionToken(payload: SessionTokenPayload): Promise<string> {
  return new SignJWT({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.id || !payload.email || !payload.role) {
      return null;
    }
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: (payload.name as string) || null,
      role: (payload.role as "admin" | "user") || "user",
    };
  } catch {
    return null;
  }
}
