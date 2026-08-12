import api from "@/services/api";

export const getProductReviews = async (productId) => {
  return await api.get(
    `/reviews/product/${productId}`
  );
};

export const createProductReview = async (
  productId,
  data
) => {
  return await api.post(
    `/reviews/product/${productId}`,
    data
  );
};

export const updateProductReview = async (
  reviewId,
  data
) => {
  return await api.put(
    `/reviews/${reviewId}`,
    data
  );
};

export const deleteProductReview = async (
  reviewId
) => {
  return await api.delete(
    `/reviews/${reviewId}`
  );
};

