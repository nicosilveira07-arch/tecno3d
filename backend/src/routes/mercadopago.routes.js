import { Router } from "express";

import {
  createOrderPaymentController,
  webhookMercadoPagoController,
} from "../controllers/mercadopago.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";


const router = Router();


// Crear Preference Mercado Pago
// Usuario autenticado
router.post(
  "/order/:orderId",
  authenticate,
  createOrderPaymentController
);


// Webhook Mercado Pago
// Mercado Pago llama esta ruta
// NO lleva authenticate
router.post(
  "/webhook",
  webhookMercadoPagoController
);


export default router;