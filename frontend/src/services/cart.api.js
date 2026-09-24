import api from "./api";

export const getCart = async () => {
  return await api.get("/cart");
};

export const addCartItem = async (
  productId,
  quantity = 1
) => {
  return await api.post("/cart", {
    productId,
    quantity,
  });
};

export const updateCartItem = async (
  productId,
  quantity
) => {
  return await api.patch(
    `/cart/${productId}`,
    {
      quantity,
    }
  );
};

export const removeCartItem = async (
  productId
) => {
  return await api.delete(
    `/cart/${productId}`
  );
};

export const clearServerCart = async () => {
  return await api.delete("/cart");
};

