import prisma from "../lib/prisma.js";

const addFavorite = async (userId, productId) => {
  return await prisma.favorite.create({
    data: {
      userId,
      productId,
    },
    include: {
      product: {
        include: {
          category: true,
          brand: true,
          images: true,
        },
      },
    },
  });
};

const removeFavorite = async (userId, productId) => {
  return await prisma.favorite.delete({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });
};

const getUserFavorites = async (userId) => {
  return await prisma.favorite.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      product: {
        include: {
          category: true,
          brand: true,
          images: true,
        },
      },
    },
  });
};

const getFavoriteByProduct = async (userId, productId) => {
  return await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });
};

export {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  getFavoriteByProduct,
};

