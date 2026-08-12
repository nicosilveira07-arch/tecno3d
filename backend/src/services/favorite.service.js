import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  getFavoriteByProduct,
} from "../repositories/favorite.repository.js";

const createFavorite = async (userId, productId) => {
  const existingFavorite = await getFavoriteByProduct(
    userId,
    productId
  );

  if (existingFavorite) {
    throw new Error("El producto ya está en favoritos.");
  }

  return await addFavorite(userId, productId);
};

const deleteFavorite = async (userId, productId) => {
  const existingFavorite = await getFavoriteByProduct(
    userId,
    productId
  );

  if (!existingFavorite) {
    throw new Error("El producto no está en favoritos.");
  }

  return await removeFavorite(userId, productId);
};

const getFavorites = async (userId) => {
  return await getUserFavorites(userId);
};

const checkFavorite = async (userId, productId) => {
  return await getFavoriteByProduct(userId, productId);
};

export {
  createFavorite,
  deleteFavorite,
  getFavorites,
  checkFavorite,
};

