import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const createCheckoutSession = async (
  userId: string,
  email: string,
  bookingId: string,
) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: {
      category: true,
      tutor: {
        include: {
          user: true,
        },
      },
    },
  });

  if (booking.studentId !== userId) {
    throw new Error("You are not authorized to pay for this booking.");
  }

  if (booking.paymentStatus === "PAID") {
    throw new Error("This booking has already been paid for.");
  }


  let appUrl = process.env.APP_URL || "https://skillbridge-iah.vercel.app";
 
  if (!appUrl.startsWith("http")) {
    appUrl = `https://${appUrl}`;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: email,
    success_url: `${appUrl}/student/dashboard/bookings?payment=success`,
    cancel_url: `${appUrl}/student/dashboard/bookings?payment=cancelled`,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${booking.category.name} Tutoring Session`,
            description: `1 Hour with ${booking.tutor.user.name}`,
          },
          // Stripe expects amounts in cents (e.g., $25.00 -> 2500)
          unit_amount: Math.round(booking.tutor.hourlyRate * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id, 
    },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { stripeSessionId: session.id },
  });

  return { url: session.url };
};

export const paymentService = {
  createCheckoutSession,
};