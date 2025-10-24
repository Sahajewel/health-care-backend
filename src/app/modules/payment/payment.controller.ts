import { Request, Response } from "express";
import { stripe } from "../../helpers/stripe";
import { PaymentService } from "./payment.service";

const handleStripeWebhookEvent = async (req: Request, res: Response) => {
  console.log("🔔 Webhook endpoint hit!");
  console.log("📦 Raw body received:", req.body);

  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    console.error("❌ No Stripe signature found");
    return res.status(400).send("No Stripe signature found");
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ Webhook secret not configured");
    return res.status(500).send("Webhook secret not configured");
  }

  let event;

  try {
    // Use the raw body that express.raw() provided
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log("✅ Webhook verified successfully");
    console.log("🎯 Event type:", event.type);
  } catch (err: any) {
    console.error("❌ Webhook verification failed:", err.message);
    console.error("Signature:", sig);
    console.error("Webhook secret length:", webhookSecret.length);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await PaymentService.handleStripeWebhookEvent(event);
    console.log("✅ Webhook processed successfully");
    return res.json({ received: true, processed: true });
  } catch (error: any) {
    console.error("❌ Webhook processing error:", error);
    return res.status(500).json({
      error: error.message,
      received: true,
      processed: false,
    });
  }
};

export const PaymentController = {
  handleStripeWebhookEvent,
};
