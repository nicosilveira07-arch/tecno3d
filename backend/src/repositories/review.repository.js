import prisma from "../lib/prisma.js";

const createReview = async (data) => {
  return await prisma.review.create({
    data,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  });
};

const getReviewsByProduct = async (productId) => {
  return await prisma.review.findMany({
    where: {
      productId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  });
};

const getUserReviewForProduct = async (
  userId,
  productId
) => {
  return await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });
};

const updateReview = async (id, data) => {
  return await prisma.review.update({
    where: {
      id,
    },
    data,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  });
};

const deleteReview = async (id) => {
  return await prisma.review.delete({
    where: {
      id,
    },
  });
};

export {
  createReview,
  getReviewsByProduct,
  getUserReviewForProduct,
  updateReview,
  deleteReview,
};

