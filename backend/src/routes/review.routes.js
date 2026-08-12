import { Router } from "express";

import {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Obtener reseñas de un producto
router.get(
  "/product/:productId",
  getReviews
);

// Crear reseña
router.post(
  "/product/:productId",
  authenticate,
  createReview
);

// Actualizar reseña
router.put(
  "/:reviewId",
  authenticate,
  updateReview
);

// Eliminar reseña
router.delete(
  "/:reviewId",
  authenticate,
  deleteReview
);

export default router;