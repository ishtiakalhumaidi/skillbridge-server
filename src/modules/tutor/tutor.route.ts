import { Router } from "express";
import { tutorController } from "./tutor.controller";
import auth, { UserRole } from "../../middleware/auth"; 

const router = Router();

router.get("/", tutorController.getAllTutors);
router.get("/:id", tutorController.getTutorById);


router.post("/", auth(UserRole.TUTOR, UserRole.ADMIN), tutorController.createTutor);
router.patch("/profile", auth(UserRole.TUTOR, UserRole.ADMIN), tutorController.updateProfile);

export const tutorRouter = router;