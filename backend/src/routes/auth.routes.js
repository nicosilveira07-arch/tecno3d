import { Router } from "express";

import {
  registerController,
  loginController,
  meController,
  changePasswordController,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.get(
  "/me",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE", "CUSTOMER"),
  meController
);

router.patch(
  "/change-password",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE", "CUSTOMER"),
  changePasswordController
);

router.get(
  "/admin-test",
  authenticate,
  allowRoles("ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Acceso permitido solo para ADMIN",
    });
  }
);

export default router;