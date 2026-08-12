import {
  createProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview,
} from "../services/review.service.js";

import {
  createReviewSchema,
  updateReviewSchema,
} from "../validators/review.validator.js";

const createReview = async (req, res) => {
  try {
    const { productId } = req.params;

    const data = createReviewSchema.parse(
      req.body
    );

    const review =
      await createProductReview({
        productId,
        userId: req.user.id,
        ...data,
      });

    return res.status(201).json({
      message: "Reseña creada correctamente.",
      data: review,
    });
  } catch (error) {
    console.error(
      "ERROR CREANDO RESEÑA:",
      error
    );

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Datos de reseña inválidos.",
        errors: error.errors,
      });
    }

    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        message: "Producto no encontrado.",
      });
    }

    if (
      error.message ===
      "REVIEW_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        message:
          "Ya calificaste este producto.",
      });
    }

    return res.status(500).json({
      message:
        "Error al crear la reseña.",
    });
  }
};

const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const result =
      await getProductReviews(productId);

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error(
      "ERROR OBTENIENDO RESEÑAS:",
      error
    );

    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        message: "Producto no encontrado.",
      });
    }

    return res.status(500).json({
      message:
        "Error al obtener las reseñas.",
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const data = updateReviewSchema.parse(
      req.body
    );

    const review =
      await updateProductReview({
        reviewId,
        userId: req.user.id,
        ...data,
      });

    return res.status(200).json({
      message:
        "Reseña actualizada correctamente.",
      data: review,
    });
  } catch (error) {
    console.error(
      "ERROR ACTUALIZANDO RESEÑA:",
      error
    );

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Datos de reseña inválidos.",
        errors: error.errors,
      });
    }

    if (error.message === "REVIEW_NOT_FOUND") {
      return res.status(404).json({
        message: "Reseña no encontrada.",
      });
    }

    if (
      error.message === "REVIEW_FORBIDDEN"
    ) {
      return res.status(403).json({
        message:
          "No podés modificar esta reseña.",
      });
    }

    return res.status(500).json({
      message:
        "Error al actualizar la reseña.",
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    await deleteProductReview({
      reviewId,
      userId: req.user.id,
    });

    return res.status(200).json({
      message:
        "Reseña eliminada correctamente.",
    });
  } catch (error) {
    console.error(
      "ERROR ELIMINANDO RESEÑA:",
      error
    );

    if (error.message === "REVIEW_NOT_FOUND") {
      return res.status(404).json({
        message: "Reseña no encontrada.",
      });
    }

    if (
      error.message === "REVIEW_FORBIDDEN"
    ) {
      return res.status(403).json({
        message:
          "No podés eliminar esta reseña.",
      });
    }

    return res.status(500).json({
      message:
        "Error al eliminar la reseña.",
    });
  }
};

export {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
};

