import { Router } from "express";

import {
  createCouponController,
  getAllCouponsController,
  getCouponByIdController,
  validateCouponController,
  updateCouponController,
  deleteCouponController,
} from "../controllers/coupon.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Obtener todos los cupones
// Solo ADMIN y EMPLOYEE

router.get(
  "/",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  getAllCouponsController
);

// Obtener cupón por ID
// Solo ADMIN y EMPLOYEE

router.get(
  "/:id",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  getCouponByIdController
);

// Validar cupón
// Público
// Se utilizará desde el checkout

router.post(
  "/validate",
  validateCouponController
);

// Crear cupón
// Solo ADMIN

router.post(
  "/",
  authenticate,
  allowRoles("ADMIN"),
  createCouponController
);

// Actualizar cupón
// Solo ADMIN

router.put(
  "/:id",
  authenticate,
  allowRoles("ADMIN"),
  updateCouponController
);

// Eliminar cupón
// Solo ADMIN

router.delete(
  "/:id",
  authenticate,
  allowRoles("ADMIN"),
  deleteCouponController
);

export default router;