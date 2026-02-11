import { Request, Response } from "express";
import catchAsynce from "../../shared/catchAsync";
import config from "../../../config";
import { stripe } from "../../helpers/stripe";
import { PaymentService } from "./payment.service";
import sendResponse from "../../shared/sendResponse";

const handleStripeWebHookEvent = catchAsynce(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = config.stripe_webhook_secret;
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret as string
      );
    } catch (err: any) {
      console.error("webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook error: ${err.message}`);
    }
    const result = await PaymentService.handleStripeWebhookEvent(event);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Webhook req send successfully",
      data: result,
    });
  }
);

export const PaymentController = {
  handleStripeWebHookEvent,
};
