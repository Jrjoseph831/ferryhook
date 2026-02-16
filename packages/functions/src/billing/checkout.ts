import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { z } from "zod";
import { users } from "@ferryhook/core";
import { stripe } from "@ferryhook/core/src/billing/stripe.js";
import { authenticate } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import * as response from "../middleware/response.js";

const checkoutSchema = z.object({
  priceId: z.string().min(1),
});

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const auth = await authenticate(event);
    if (!auth) return response.unauthorized();

    const validation = validateBody(event.body, checkoutSchema);
    if (!validation.success) {
      return response.validationError(validation.errors);
    }

    const user = await users.getById(auth.userId);
    if (!user) return response.notFound("User");

    // Create Stripe customer if not already
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      customerId = await stripe.createCustomer(user.email, user.userId);
      await users.update(user.userId, { stripeCustomerId: customerId });
    }

    const appUrl = process.env.APP_URL ?? "https://ferryhook.io";
    const checkoutUrl = await stripe.createCheckoutSession(
      auth.userId,
      customerId,
      validation.data.priceId,
      `${appUrl}/settings?billing=success`,
      `${appUrl}/settings?billing=cancelled`
    );

    return response.success({ url: checkoutUrl });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Checkout error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
