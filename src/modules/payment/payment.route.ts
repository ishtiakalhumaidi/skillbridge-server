import express, { Router } from "express";
import { paymentController } from "./payment.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();


router.post(
  "/create-checkout",
  auth(UserRole.STUDENT),
  paymentController.createCheckout,
);


export const paymentRouter = router;
