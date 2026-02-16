import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { users } from "@ferryhook/core";
import { stripe } from "@ferryhook/core/src/billing/stripe.js";
import { authenticate } from "../middleware/auth.js";
import * as response from "../middleware/response.js";

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const auth = await authenticate(event);
    if (!auth) return response.unauthorized();

    const user = await users.getById(auth.userId);
    if (!user) return response.notFound("User");

    if (!user.stripeCustomerId) {
      return response.error(400, "VALIDATION_ERROR", "No billing account found. Subscribe to a plan first.");
    }

    const appUrl = process.env.APP_URL ?? "https://ferryhook.io";
    const portalUrl = await stripe.createPortalSession(
      user.stripeCustomerId,
      `${appUrl}/settings`
    );

    return response.success({ url: portalUrl });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Portal error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
