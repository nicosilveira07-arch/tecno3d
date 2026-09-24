import { Router } from "express";

import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
} from "../controllers/cart.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getCartController);

router.post("/", addToCartController);

router.patch("/:productId", updateCartItemController);

router.delete("/:productId", removeFromCartController);

router.delete("/", clearCartController);

export default router;

