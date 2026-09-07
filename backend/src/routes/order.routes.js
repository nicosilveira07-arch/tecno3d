import { Router } from "express";

import {
  createOrderController,
  getPendingOrderController,
  cancelPendingOrderController,
  getMyOrdersController,
  getOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
} from "../controllers/order.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import { allowRoles } from "../middlewares/role.middleware.js";

const router = Router();

// CUSTOMER - EMPLOYEE - ADMIN

// Crear pedido

router.post(
  "/",
  authenticate,
  allowRoles("CUSTOMER", "EMPLOYEE", "ADMIN"),
  createOrderController
);

// CUSTOMER - EMPLOYEE - ADMIN

// Ver sus propios pedidos

router.get(
  "/my-orders",
  authenticate,
  allowRoles("CUSTOMER", "EMPLOYEE", "ADMIN"),
  getMyOrdersController
);

// CUSTOMER - EMPLOYEE - ADMIN

// Continuar compra pendiente

router.get(
  "/pending/:id",
  authenticate,
  allowRoles("CUSTOMER", "EMPLOYEE", "ADMIN"),
  getPendingOrderController
);

// CUSTOMER - EMPLOYEE - ADMIN

// Cancelar compra pendiente

router.patch(
  "/pending/:id/cancel",
  authenticate,
  allowRoles("CUSTOMER", "EMPLOYEE", "ADMIN"),
  cancelPendingOrderController
);

// EMPLOYEE - ADMIN

// Ver todos los pedidos

router.get(
  "/",
  authenticate,
  allowRoles("EMPLOYEE", "ADMIN"),
  getOrdersController
);

// CUSTOMER - EMPLOYEE - ADMIN

// Ver pedido por ID

router.get(
  "/:id",
  authenticate,
  allowRoles("CUSTOMER", "EMPLOYEE", "ADMIN"),
  getOrderByIdController
);

// EMPLOYEE - ADMIN

// Cambiar estado del pedido

router.patch(
  "/:id/status",
  authenticate,
  allowRoles("EMPLOYEE", "ADMIN"),
  updateOrderStatusController
);

export default router;

