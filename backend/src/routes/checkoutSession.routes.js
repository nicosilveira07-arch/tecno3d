import express from "express";

import {
authenticate,
} from "../middlewares/auth.middleware.js";

import {
createCheckoutSessionController,
getCheckoutSessionController,
updateCheckoutSessionController,
markCheckoutSessionPaymentPendingController,
deleteCheckoutSessionController,
} from "../controllers/checkoutSession.controller.js";

const router = express.Router();

// Crear una sesión temporal de checkout

router.post(
"/",
authenticate,
createCheckoutSessionController
);

// Obtener una sesión propia

router.get(
"/:id",
authenticate,
getCheckoutSessionController
);

// Actualizar una sesión propia

router.patch(
"/:id",
authenticate,
updateCheckoutSessionController
);

// Marcar el pago como pendiente

router.patch(
"/:id/payment-pending",
authenticate,
markCheckoutSessionPaymentPendingController
);

// Eliminar una sesión propia

router.delete(
"/:id",
authenticate,
deleteCheckoutSessionController
);

export default router;
