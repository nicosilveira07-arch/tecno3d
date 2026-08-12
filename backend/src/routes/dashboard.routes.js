import { Router } from "express";

import {
  getDashboardController,
} from "../controllers/dashboard.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  getDashboardController,
);

export default router;