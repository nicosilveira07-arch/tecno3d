import {
  createFavorite,
  deleteFavorite,
  getFavorites,
  checkFavorite,
} from "../services/favorite.service.js";

const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "El producto es obligatorio.",
      });
    }

    const favorite = await createFavorite(
      userId,
      productId
    );

    return res.status(201).json({
      message: "Producto agregado a favoritos.",
      data: favorite,
    });
  } catch (error) {
    console.error(
      "ERROR AGREGANDO FAVORITO:",
      error
    );

    return res.status(400).json({
      message: error.message,
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await deleteFavorite(userId, productId);

    return res.status(200).json({
      message: "Producto eliminado de favoritos.",
    });
  } catch (error) {
    console.error(
      "ERROR ELIMINANDO FAVORITO:",
      error
    );

    return res.status(400).json({
      message: error.message,
    });
  }
};

const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await getFavorites(userId);

    return res.status(200).json({
      data: favorites,
    });
  } catch (error) {
    console.error(
      "ERROR OBTENIENDO FAVORITOS:",
      error
    );

    return res.status(500).json({
      message: "No se pudieron obtener los favoritos.",
    });
  }
};

const checkMyFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const favorite = await checkFavorite(
      userId,
      productId
    );

    return res.status(200).json({
      isFavorite: Boolean(favorite),
    });
  } catch (error) {
    console.error(
      "ERROR VERIFICANDO FAVORITO:",
      error
    );

    return res.status(500).json({
      message: "No se pudo verificar el favorito.",
    });
  }
};

export {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkMyFavorite,
};

