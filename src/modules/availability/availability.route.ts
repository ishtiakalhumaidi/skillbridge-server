import { Router } from "express";
import { availabilityController } from "./availability.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();

router.get(
  "/tutor/:tutorId",
  availabilityController.getTutorAvailabilityPublic,
);

router.post(
  "/",
  auth(UserRole.TUTOR),
  availabilityController.createAvailability,
);
router.get(
  "/my-availability",
  auth(UserRole.TUTOR),
  availabilityController.getMyAvailability,
);
router.delete(
  "/:id",
  auth(UserRole.TUTOR),
  availabilityController.deleteAvailability,
);

export const availabilityRouter = router;
