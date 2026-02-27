import { Router } from "express";
import { tutorController } from "./tutor.controller";
import auth, { UserRole } from "../../middleware/auth"; 

const router = Router();

router.get("/", tutorController.getAllTutors);
router.get("/:id", tutorController.getTutorById);


router.post("/", auth(UserRole.USER), tutorController.createTutor);
router.put("/profile", auth(UserRole.USER), tutorController.updateProfile);

export const tutorRouter = router;