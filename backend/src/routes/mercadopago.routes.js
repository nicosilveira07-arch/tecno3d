import { Router } from "express";

import {
  createOrderPaymentController,
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


export default router;