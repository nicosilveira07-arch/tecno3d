import { Router } from "express";

import {
  getCheckoutController,
  confirmCheckoutController,
} from "../controllers/checkout.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";


const router = Router();


router.use(authenticate);


router.get(
  "/",
  getCheckoutController
);


router.post(
  "/confirm",
  confirmCheckoutController
);


export default router;