import { hmacSha256, hmacSha256Base64, timingSafeCompare } from "../utils/crypto.js";

export const signatureVerifiers: Record<
  string,
  (payload: string, header: string, secret: string) => boolean
> = {
  stripe: (payload: string, header: string, secret: string): boolean => {
    const elements = Object.fromEntries(
      header.split(",").map((e) => {
        const idx = e.indexOf("=");
        return [e.substring(0, idx), e.substring(idx + 1)];
      })
    );
    const timestamp = elements["t"];
    const signatureV1 = elements["v1"];
    if (!timestamp || !signatureV1) return false;

    const signed = `${timestamp}.${payload}`;
    const expected = hmacSha256(signed, secret);
    return timingSafeCompare(expected, signatureV1);
  },

  github: (payload: string, header: string, secret: string): boolean => {
    const expected = "sha256=" + hmacSha256(payload, secret);
    return timingSafeCompare(expected, header);
  },

  shopify: (payload: string, header: string, secret: string): boolean => {
    const expected = hmacSha256Base64(payload, secret);
    return timingSafeCompare(expected, header);
  },

  "generic-hmac-sha256": (payload: string, header: string, secret: string): boolean => {
    const expected = hmacSha256(payload, secret);
    return timingSafeCompare(expected, header);
  },
};

export function verifyInboundSignature(
  algorithm: string,
  payload: string,
  header: string,
  secret: string
): boolean {
  const verifier = signatureVerifiers[algorithm];
  if (!verifier) return false;
  return verifier(payload, header, secret);
}
