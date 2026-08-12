import api from "./api";

const getFavorites = async () => {
  const response = await api.get("/favorites");

  return response.data;
};

const addFavorite = async (productId) => {
  const response = await api.post("/favorites", {
    productId,
  });

  return response.data;
};

const removeFavorite = async (productId) => {
  const response = await api.delete(`/favorites/${productId}`);

  return response.data;
};

const checkFavorite = async (productId) => {
  const response = await api.get(`/favorites/check/${productId}`);

  return response.data;
};

export {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
};