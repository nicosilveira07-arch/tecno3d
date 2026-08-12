import api from "./api";

export async function getBanners() {
  const response = await api.get("/banners");

  return response.data;
}

export async function getActiveBanners() {
  const response = await api.get("/banners/active");

  return response.data;
}

export async function createBanner(data) {
  const response = await api.post("/banners", data);

  return response.data;
}

export async function updateBanner(id, data) {
  const response = await api.put(
    `/banners/${id}`,
    data
  );

  return response.data;
}

export async function deleteBanner(id) {
  const response = await api.delete(
    `/banners/${id}`
  );

  return response.data;
}