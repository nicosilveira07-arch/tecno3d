import { Router } from "express";

import {
createOrderPaymentController,
} from "../controllers/mercadopago.controller.js";

import {
authenticate,
} from "../middlewares/auth.middleware.js";

const router = Router();

// Crear Preference Mercado Pago
// El parámetro actualmente mantiene el nombre
// orderId por compatibilidad con la ruta existente,
// pero ahora contiene el ID de CheckoutSession.

router.post(
"/order/:orderId",
authenticate,
createOrderPaymentController
);

export default router;
