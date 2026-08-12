import { Router } from "express";

import {
  getCartController,
  addToCartController,
  removeFromCartController,
  clearCartController,
} from "../controllers/cart.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getCartController);

router.post("/", addToCartController);

router.delete("/:productId", removeFromCartController);

router.delete("/", clearCartController);

export default router;