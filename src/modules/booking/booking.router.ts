import { Router } from "express";
import { bookingController } from "./booking.controller";
import auth, { UserRole } from "../../middleware/auth";
const router = Router();

router.post(
  "/",
  auth(UserRole.STUDENT, UserRole.TUTOR),
  bookingController.createBooking,
);

router.get(
  "/my-bookings",
  auth(UserRole.STUDENT, UserRole.TUTOR),
  bookingController.getMyBookings,
);

router.patch(
  "/:id/status",
  auth(UserRole.STUDENT, UserRole.TUTOR),
  bookingController.updateBookingStatus,
);

export const bookingRouter = router;
