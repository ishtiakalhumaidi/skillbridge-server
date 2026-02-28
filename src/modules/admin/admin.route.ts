import { Router } from "express";
import { adminController } from "./admin.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();


router.get("/stats", auth(UserRole.ADMIN), adminController.getPlatformStats);


router.get("/users", auth(UserRole.ADMIN), adminController.getAllUsers);
router.patch("/users/:id/status", auth(UserRole.ADMIN), adminController.updateUserStatus);


router.get("/bookings", auth(UserRole.ADMIN), adminController.getAllBookings);

export const adminRouter = router;