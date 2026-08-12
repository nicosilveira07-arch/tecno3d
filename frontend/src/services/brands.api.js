import api from "./api";

export async function getBrands() {
  const response = await api.get("/brands");
  return response.data;
}

export async function createBrand(data) {
  const response = await api.post("/brands", data);
  return response.data;
}

export async function updateBrand(id, data) {
  const response = await api.put(`/brands/${id}`, data);
  return response.data;
}

export async function deleteBrand(id) {
  const response = await api.delete(`/brands/${id}`);
  return response.data;
}