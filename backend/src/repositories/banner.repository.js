import prisma from "../lib/prisma.js";

const createBanner = async (data) => {
  return await prisma.banner.create({
    data,
  });
};

const getBanners = async () => {
  return await prisma.banner.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getActiveBanners = async () => {
  return await prisma.banner.findMany({
    where: {
      active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getBannerById = async (id) => {
  return await prisma.banner.findUnique({
    where: {
      id,
    },
  });
};

const updateBanner = async (id, data) => {
  return await prisma.banner.update({
    where: {
      id,
    },
    data,
  });
};

const deleteBanner = async (id) => {
  return await prisma.banner.delete({
    where: {
      id,
    },
  });
};

export {
  createBanner,
  getBanners,
  getActiveBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};