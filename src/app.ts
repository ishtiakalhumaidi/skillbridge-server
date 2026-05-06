import { toNodeHandler } from "better-auth/node";
import express, { type Application } from "express";
import { auth } from "./lib/auth";
import cors from "cors";
import { tutorRouter } from "./modules/tutor/tutor.route";
import { categoryRouter } from "./modules/category/category.route";
import { availabilityRouter } from "./modules/availability/availability.route";
import { bookingRouter } from "./modules/booking/booking.router";
import { reviewRouter } from "./modules/review/review.route";
import { tutorSubjectRouter } from "./modules/tutorSubject/tutorSubject.route";
import { adminRouter } from "./modules/admin/admin.route";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { paymentRouter } from "./modules/payment/payment.route";
import { paymentController } from "./modules/payment/payment.controller";

const app: Application = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://skillbridge-client-iota.vercel.app",
  "https://skillbridge-iah.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook,
);
app.use(express.json());

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use("/api/v1/tutors", tutorRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/availability", availabilityRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/tutor-subjects", tutorSubjectRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/payments", paymentRouter);

app.get("/", (req, res) => {
  res.send("SkillBridge web is cooking...");
});
app.use(globalErrorHandler);
export default app;
