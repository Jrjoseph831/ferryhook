import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { z } from "zod";
import { users, jwt, hashPassword } from "@ferryhook/core";
import { validateBody } from "../middleware/validate.js";
import * as response from "../middleware/response.js";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(100),
});

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const validation = validateBody(event.body, signupSchema);
    if (!validation.success) {
      return response.validationError(validation.errors);
    }

    const { email, password, name } = validation.data;

    // Check for duplicate email
    const existing = await users.getByEmail(email);
    if (existing) {
      return response.error(
        400,
        "VALIDATION_ERROR",
        "An account with this email already exists",
        [{ field: "email", message: "Email already in use" }]
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await users.create({
      email,
      name,
      passwordHash,
    });

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
        message: "User signed up",
        userId: user.userId,
      })
    );

    return response.setCookie(
      response.success(
        {
          user: {
            id: user.userId,
            email: user.email,
            name: user.name,
            plan: user.plan,
          },
          accessToken,
          expiresIn: 3600,
        },
        201
      ),
      "refresh_token",
      refreshToken,
      30 * 24 * 60 * 60
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Signup error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
