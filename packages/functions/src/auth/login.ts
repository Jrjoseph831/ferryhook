import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { z } from "zod";
import { users, jwt, verifyPassword } from "@ferryhook/core";
import { validateBody } from "../middleware/validate.js";
import * as response from "../middleware/response.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const validation = validateBody(event.body, loginSchema);
    if (!validation.success) {
      return response.validationError(validation.errors);
    }

    const { email, password } = validation.data;

    // Lookup user by email
    const user = await users.getByEmail(email);
    if (!user || !user.passwordHash) {
      return response.error(401, "UNAUTHORIZED", "Invalid email or password");
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return response.error(401, "UNAUTHORIZED", "Invalid email or password");
    }

    // Generate JWT
    const accessToken = await jwt.signAccessToken({
      userId: user.userId,
      email: user.email,
      plan: user.plan,
    });

    const refreshToken = await jwt.signRefreshToken(user.userId);

    console.log(
      JSON.stringify({
        level: "info",
        message: "User logged in",
        userId: user.userId,
      })
    );

    return response.setCookie(
      response.success({
        user: {
          id: user.userId,
          email: user.email,
          name: user.name,
          plan: user.plan,
        },
        accessToken,
        expiresIn: 3600,
      }),
      "refresh_token",
      refreshToken,
      30 * 24 * 60 * 60
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Login error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
