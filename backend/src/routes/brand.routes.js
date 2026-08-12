import { Router } from "express";

import {
  getAllBrandsController,
  getBrandByIdController,
  createBrandController,
  updateBrandController,
  deleteBrandController,
} from "../controllers/brand.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", getAllBrandsController);
router.get("/:id", getBrandByIdController);

router.post(
  "/",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  createBrandController
);

router.put(
  "/:id",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  updateBrandController
);

router.delete(
  "/:id",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  deleteBrandController
);

export default router;