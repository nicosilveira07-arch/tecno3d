import api from "./api";

export async function getStoreSettings() {
  const response = await api.get(
    "/settings"
  );

  return response.data;
}

export async function updateStoreSettings(data) {
  const response = await api.put(
    "/settings",
    data
  );

  return response.data;
}