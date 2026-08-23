import { Router } from "express";

import {
  getAllUsersController,
  createUserController,
  updateUserRoleController,
  deleteEmployeeController,
  deleteUserController,
} from "../controllers/user.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  allowRoles("ADMIN"),
  getAllUsersController
);

router.post(
  "/",
  authenticate,
  allowRoles("ADMIN"),
  createUserController
);

router.patch(
  "/:id/role",
  authenticate,
  allowRoles("ADMIN"),
  updateUserRoleController
);

// ELIMINAR EMPLEADO CREADO POR EL ADMIN
router.delete(
  "/employee/:id",
  authenticate,
  allowRoles("ADMIN"),
  deleteEmployeeController
);

// ADMIN PUEDE ELIMINAR CUALQUIER USUARIO
router.delete(
  "/:id",
  authenticate,
  allowRoles("ADMIN"),
  deleteUserController
);

export default router;