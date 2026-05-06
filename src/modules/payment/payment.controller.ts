import type { NextFunction, Request, Response } from "express";
import { paymentService } from "./payment.service";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import type { Stripe } from "stripe";

const createCheckout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized!" });
    }

    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID is required." });
    }

    const result = await paymentService.createCheckoutSession(
      req.user.id, 
      req.user.email, 
      bookingId
    );

    res.status(200).json({
      success: true,
      message: "Checkout session created.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};


const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // We assume you passed the bookingId in the Stripe metadata when creating the session
    const bookingId = session.metadata?.bookingId; 
console.log(bookingId);
    if (bookingId) {
      try {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID",
            stripeSessionId: session.id,
            pricePaid: session.amount_total ? session.amount_total / 100 : null,
          },
        });
        console.log(`Booking ${bookingId} successfully confirmed via Webhook!`);
      } catch (error) {
        console.error("Database update failed for booking:", bookingId, error);
      }
    }
  }

 
  res.status(200).send({ received: true });
};

export const paymentController = {
  createCheckout,
  stripeWebhook,
};