import { Router } from "express";
import { tutorSubjectController } from "./tutorSubject.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.TUTOR),
  tutorSubjectController.addSubject,
);

router.delete(
  "/:categoryId",
  auth(UserRole.TUTOR, UserRole.ADMIN),
  tutorSubjectController.removeSubject,
);

export const tutorSubjectRouter = router;
