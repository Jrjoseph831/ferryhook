import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { jwt, users } from "@ferryhook/core";
import * as response from "../middleware/response.js";

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...rest] = c.trim().split("=");
      return [key, rest.join("=")];
    })
  );
}

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const cookies = parseCookies(
      event.headers["cookie"] ?? event.headers["Cookie"]
    );
    const refreshToken = cookies["refresh_token"];

    if (!refreshToken) {
      return response.unauthorized();
    }

    // Verify refresh token
    let payload;
    try {
      payload = await jwt.verifyRefreshToken(refreshToken);
    } catch {
      return response.unauthorized();
    }

    // Load user to get current plan/email
    const user = await users.getById(payload.sub);
    if (!user) {
      return response.unauthorized();
    }

    // Issue new access token
    const accessToken = await jwt.signAccessToken({
      userId: user.userId,
      email: user.email,
      plan: user.plan,
    });

    // Issue new refresh token (rotation)
    const newRefreshToken = await jwt.signRefreshToken(user.userId);

    return response.setCookie(
      response.success({
        accessToken,
        expiresIn: 3600,
      }),
      "refresh_token",
      newRefreshToken,
      30 * 24 * 60 * 60
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Refresh error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
