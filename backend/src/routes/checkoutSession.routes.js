import express from "express";

import {
  allowRoles,
} from "../middlewares/role.middleware.js";

import {
  authenticate,
} from "../middlewares/auth.middleware.js";

import {
  createCheckoutSessionController,
  getCheckoutSessionController,
  updateCheckoutSessionController,
  markCheckoutSessionPaymentPendingController,
  deleteCheckoutSessionController,
  getPendingCheckoutSessionsByUserController,
  getPendingCheckoutSessionsController,
} from "../controllers/checkoutSession.controller.js";

const router = express.Router();

// ======================================================
// CREAR UNA SESIÓN TEMPORAL DE CHECKOUT
// ======================================================

router.post(
  "/",
  authenticate,
  createCheckoutSessionController
);

// ======================================================
// CHECKOUTS EN TRÁMITE DEL USUARIO
// ======================================================

router.get(
  "/my-pending",
  authenticate,
  getPendingCheckoutSessionsByUserController
);

// ======================================================
// CHECKOUTS EN TRÁMITE PARA ADMIN
// ======================================================

router.get(
  "/admin/pending",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  getPendingCheckoutSessionsController
);

// ======================================================
// OBTENER UNA SESIÓN PROPIA
// ======================================================

router.get(
  "/:id",
  authenticate,
  getCheckoutSessionController
);

// ======================================================
// ACTUALIZAR UNA SESIÓN PROPIA
// ======================================================

router.patch(
  "/:id",
  authenticate,
  updateCheckoutSessionController
);

// ======================================================
// MARCAR EL PAGO COMO PENDIENTE
// ======================================================

router.patch(
  "/:id/payment-pending",
  authenticate,
  markCheckoutSessionPaymentPendingController
);

// ======================================================
// ELIMINAR UNA SESIÓN PROPIA
// ======================================================

router.delete(
  "/:id",
  authenticate,
  deleteCheckoutSessionController
);

export default router;