import Stripe from "stripe";
import { getConfig } from "../config.js";

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  const config = getConfig();
  stripeClient = new Stripe(config.stripeSecretKey, {
    apiVersion: "2024-06-20",
    typescript: true,
  });
  return stripeClient;
}

export const stripe = {
  async createCustomer(email: string, userId: string): Promise<string> {
    const s = getStripe();
    const customer = await s.customers.create({
      email,
      metadata: { userId },
    });
    return customer.id;
  },

  async createCheckoutSession(
    userId: string,
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    const s = getStripe();
    const session = await s.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId },
    });
    return session.url ?? "";
  },

  async createPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<string> {
    const s = getStripe();
    const session = await s.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  },

  async reportUsage(
    subscriptionItemId: string,
    quantity: number
  ): Promise<void> {
    const s = getStripe();
    await s.subscriptionItems.createUsageRecord(subscriptionItemId, {
      quantity,
      timestamp: Math.floor(Date.now() / 1000),
      action: "increment",
    });
  },

  constructEvent(body: string, signature: string): Stripe.Event {
    const s = getStripe();
    const config = getConfig();
    return s.webhooks.constructEvent(body, signature, config.stripeWebhookSecret);
  },
};
