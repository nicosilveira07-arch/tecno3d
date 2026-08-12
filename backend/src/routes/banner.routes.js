import { Router } from "express";

import {
  createBannerController,
  getBannersController,
  getActiveBannersController,
  getBannerByIdController,
  updateBannerController,
  deleteBannerController,
} from "../controllers/banner.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Banners públicos
router.get("/", getBannersController);

router.get("/active", getActiveBannersController);

router.get("/:id", getBannerByIdController);

// Crear banner
router.post(
  "/",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  createBannerController
);

// Actualizar banner
router.put(
  "/:id",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  updateBannerController
);

// Eliminar banner
router.delete(
  "/:id",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  deleteBannerController
);

export default router;