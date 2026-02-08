import { createHmac, randomBytes, timingSafeEqual as nodeTse } from "crypto";
import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;

export function hmacSha256(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("hex");
}

export function hmacSha256Base64(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64");
}

export function sha256Hash(data: string): string {
  return createHmac("sha256", "").update(data).digest("hex");
}

export function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return nodeTse(Buffer.from(a), Buffer.from(b));
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateApiKeyRaw(): string {
  const bytes = randomBytes(32);
  return `fh_live_${bytes.toString("base64url")}`;
}

export function hashApiKey(key: string): string {
  return sha256Hash(key);
}

export function signOutboundPayload(
  payload: string,
  secret: string
): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedContent = `${timestamp}.${payload}`;
  const signature = hmacSha256(signedContent, secret);
  return `t=${timestamp},v1=${signature}`;
}
