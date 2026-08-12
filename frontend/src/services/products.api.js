import api from "./api";

export async function getProducts(params = {}) {
  const response = await api.get("/products", {
    params,
  });

  return response.data;
}

export async function createProduct(data) {
  const response = await api.post(
    "/products",
    data
  );

  return response.data;
}

export async function updateProduct(id, data) {
  const response = await api.put(
    `/products/${id}`,
    data
  );

  return response.data;
}

export async function deleteProduct(id) {
  const response = await api.delete(
    `/products/${id}`
  );

  return response.data;
}

export async function getProductById(id) {
  const response = await api.get(
    `/products/${id}`
  );

  return response.data;
}

export async function getProductReviews(productId) {
  const response = await api.get(
    `/reviews/product/${productId}`
  );

  return response.data;
}

