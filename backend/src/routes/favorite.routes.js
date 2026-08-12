import express from "express";

import {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkMyFavorite,
} from "../controllers/favorite.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  getMyFavorites
);

router.get(
  "/check/:productId",
  authenticate,
  checkMyFavorite
);

router.post(
  "/",
  authenticate,
  addFavorite
);

router.delete(
  "/:productId",
  authenticate,
  removeFavorite
);

export default router;

