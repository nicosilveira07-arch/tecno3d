import prisma from "../lib/prisma.js";

import {
  createReview,
  getReviewsByProduct,
  getUserReviewForProduct,
  updateReview,
  deleteReview,
} from "../repositories/review.repository.js";

const createProductReview = async ({
  productId,
  userId,
  rating,
  comment,
}) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const existingReview =
    await getUserReviewForProduct(
      userId,
      productId
    );

  if (existingReview) {
    throw new Error("REVIEW_ALREADY_EXISTS");
  }

  return await createReview({
    productId,
    userId,
    rating,
    comment: comment || null,
  });
};

const getProductReviews = async (productId) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const reviews =
    await getReviewsByProduct(productId);

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : reviews.reduce(
          (sum, review) =>
            sum + review.rating,
          0
        ) / totalReviews;

  return {
    reviews,
    totalReviews,
    averageRating: Number(
      averageRating.toFixed(1)
    ),
  };
};

const updateProductReview = async ({
  reviewId,
  userId,
  rating,
  comment,
}) => {
  const existingReview =
    await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

  if (!existingReview) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  if (existingReview.userId !== userId) {
    throw new Error("REVIEW_FORBIDDEN");
  }

  return await updateReview(reviewId, {
    ...(rating !== undefined && {
      rating,
    }),
    ...(comment !== undefined && {
      comment: comment || null,
    }),
  });
};

const deleteProductReview = async ({
  reviewId,
  userId,
}) => {
  const existingReview =
    await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

  if (!existingReview) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  if (existingReview.userId !== userId) {
    throw new Error("REVIEW_FORBIDDEN");
  }

  return await deleteReview(reviewId);
};

export {
  createProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview,
};

