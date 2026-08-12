import { Router } from "express";

import {
  mercadoPagoWebhookController,
} from "../controllers/webhook.controller.js";


const router = Router();


router.post(
  "/mercadopago",
  mercadoPagoWebhookController
);


export default router;