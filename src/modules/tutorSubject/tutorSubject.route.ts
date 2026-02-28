import { Router } from "express";
import { tutorSubjectController } from "./tutorSubject.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();

router.post("/", auth(UserRole.USER,UserRole.TUTOR), tutorSubjectController.addSubject);

router.delete("/:categoryId", auth(UserRole.TUTOR), tutorSubjectController.removeSubject);

export const tutorSubjectRouter = router;