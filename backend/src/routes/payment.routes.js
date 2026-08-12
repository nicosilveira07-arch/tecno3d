import { Router } from "express";

import {
  getPaymentController,
  createPaymentController,
  updatePaymentController,
} from "../controllers/payment.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";


const router = Router();


router.use(authenticate);


router.get(
  "/order/:orderId",
  getPaymentController
);


router.post(
  "/",
  createPaymentController
);


router.patch(
  "/:id",
  updatePaymentController
);


export default router;