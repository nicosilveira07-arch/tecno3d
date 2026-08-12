import api from "./api";

export async function uploadImage(file) {
  const formData = new FormData();

  formData.append("images", file);

  const response = await api.post(
    "/upload",
    formData
  );

  return response.data;
}

