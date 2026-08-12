import api from "./api";

export async function getAddresses() {
  const response = await api.get("/addresses");

  return response.data;
}

export async function getAddressById(id) {
  const response = await api.get(`/addresses/${id}`);

  return response.data;
}

export async function createAddress(data) {
  const response = await api.post("/addresses", data);

  return response.data;
}

export async function updateAddress(id, data) {
  const response = await api.put(`/addresses/${id}`, data);

  return response.data;
}

export async function deleteAddress(id) {
  const response = await api.delete(`/addresses/${id}`);

  return response.data;
}