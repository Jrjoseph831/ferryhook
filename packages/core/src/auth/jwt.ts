import { SignJWT, jwtVerify } from "jose";
import { getConfig } from "../config.js";
import { generateRefreshTokenId } from "../utils/id.js";
import type { Plan } from "../types/index.js";

const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "30d";
const ISSUER = "ferryhook";
const AUDIENCE = "ferryhook-api";

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(getConfig().jwtSecret);
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  plan: Plan;
}

export interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
  jti: string;
}

export const jwt = {
  async signAccessToken(payload: {
    userId: string;
    email: string;
    plan: Plan;
  }): Promise<string> {
    return new SignJWT({
      email: payload.email,
      plan: payload.plan,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(payload.userId)
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRY)
      .setIssuer(ISSUER)
      .setAudience(AUDIENCE)
      .sign(getSecretKey());
  },

  async signRefreshToken(userId: string): Promise<string> {
    const jti = generateRefreshTokenId();
    return new SignJWT({
      type: "refresh",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(userId)
      .setJti(jti)
      .setIssuedAt()
      .setExpirationTime(REFRESH_TOKEN_EXPIRY)
      .setIssuer(ISSUER)
      .sign(getSecretKey());
  },

  async verifyAccessToken(
    token: string
  ): Promise<AccessTokenPayload> {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      plan: payload.plan as Plan,
    };
  },

  async verifyRefreshToken(
    token: string
  ): Promise<RefreshTokenPayload> {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
    });
    return {
      sub: payload.sub as string,
      type: payload.type as "refresh",
      jti: payload.jti as string,
    };
  },
};
