import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { users } from "@ferryhook/core";
import { stripe } from "@ferryhook/core/src/billing/stripe.js";
import { getPlanByPriceId } from "@ferryhook/core/src/billing/plans.js";
import type Stripe from "stripe";

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const sig = event.headers["stripe-signature"];
    if (!sig || !event.body) {
      return { statusCode: 400, body: "Missing signature" };
    }

    const stripeEvent = stripe.constructEvent(event.body, sig);

    switch (stripeEvent.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(stripeEvent.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(stripeEvent.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(stripeEvent.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(stripeEvent.data.object as Stripe.Invoice);
        break;
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Stripe webhook error",
        error: String(err),
      })
    );
    return { statusCode: 400, body: "Webhook error" };
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  if (!userId) return;

  const subscriptionId = session.subscription as string;
  if (!subscriptionId) return;

  // Look up the subscription to get the price ID
  const user = await users.getById(userId);
  if (!user) return;

  await users.update(userId, {
    stripeSubId: subscriptionId,
    stripeCustomerId: session.customer as string,
  });

  console.log(
    JSON.stringify({
      level: "info",
      message: "Checkout completed",
      userId,
      subscriptionId,
    })
  );
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) return;

  const plan = getPlanByPriceId(priceId);
  if (!plan) return;

  // Find user by stripe customer ID
  const customerId = subscription.customer as string;
  // We need to search by stripeCustomerId — for now, use metadata
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await users.update(userId, {
    plan,
    stripeSubId: subscription.id,
  });

  console.log(
    JSON.stringify({
      level: "info",
      message: "Subscription updated",
      userId,
      plan,
    })
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await users.update(userId, {
    plan: "free",
    stripeSubId: null,
  });

  console.log(
    JSON.stringify({
      level: "info",
      message: "Subscription cancelled, reverted to free",
      userId,
    })
  );
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;
  console.error(
    JSON.stringify({
      level: "error",
      message: "Payment failed",
      customerId,
      invoiceId: invoice.id,
    })
  );
  // TODO: Send alert email to user about failed payment
}
