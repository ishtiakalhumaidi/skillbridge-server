import { Router } from "express";
import { categoryController } from "./category.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();


router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);


router.post("/", auth(UserRole.ADMIN), categoryController.createCategory);

router.patch("/:id", auth(UserRole.ADMIN), categoryController.updateCategory);

router.delete("/:id", auth(UserRole.ADMIN), categoryController.deleteCategory);

export const categoryRouter = router;
