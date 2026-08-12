import { Router } from "express";

import {
  createCategoryController,
  getCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/category.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";


const router = Router();


// Público
router.get(
  "/",
  getCategoriesController
);


router.get(
  "/:id",
  getCategoryByIdController
);


// MODERATOR (EMPLOYEE) y ADMIN
router.post(
  "/",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  createCategoryController
);


router.put(
  "/:id",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  updateCategoryController
);


// Solo ADMIN
router.delete(
  "/:id",
  authenticate,
  allowRoles("ADMIN"),
  deleteCategoryController
);


export default router;