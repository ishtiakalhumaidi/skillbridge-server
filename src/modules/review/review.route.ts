import { Router } from "express";
import { reviewController } from "./review.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();

router.get("/tutor/:tutorId", reviewController.getTutorReviews);

router.post(
  "/",
  auth(UserRole.USER, UserRole.STUDENT),
  reviewController.createReview,
);

export const reviewRouter = router;
