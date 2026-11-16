import { Router } from "express";

import {
  getPaymentController,
  createPaymentController,
  updatePaymentController,
} from "../controllers/payment.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";


const router = Router();


router.use(authenticate);


router.get(
  "/order/:orderId",
  getPaymentController
);


router.post(
  "/",
  allowRoles("ADMIN", "EMPLOYEE"),
  createPaymentController
);


router.patch(
  "/:id",
  allowRoles("ADMIN", "EMPLOYEE"),
  updatePaymentController
);


export default router;