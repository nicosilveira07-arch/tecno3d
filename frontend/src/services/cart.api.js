import api from "./api";

export const getCart = async () => {
  return await api.get("/cart");
};

export const addCartItem = async (
  productId,
  quantity = 1,
  variantId = null
) => {
  return await api.post("/cart", {
    productId,
    quantity,
    variantId,
  });
};

export const updateCartItem = async (
  productId,
  quantity,
  variantId = null
) => {
  return await api.patch(
    `/cart/${productId}`,
    {
      quantity,
      variantId,
    }
  );
};

export const removeCartItem = async (
  productId,
  variantId = null
) => {
  return await api.delete(
    `/cart/${productId}`,
    {
      data: {
        variantId,
      },
    }
  );
};

export const clearServerCart = async () => {
  return await api.delete("/cart");
};

