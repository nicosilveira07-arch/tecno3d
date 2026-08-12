import {
  createBanner as createBannerRepository,
  getBanners as getBannersRepository,
  getActiveBanners as getActiveBannersRepository,
  getBannerById as getBannerByIdRepository,
  updateBanner as updateBannerRepository,
  deleteBanner as deleteBannerRepository,
} from "../repositories/banner.repository.js";

const createBanner = async (data) => {
  return await createBannerRepository(data);
};

const getBanners = async () => {
  return await getBannersRepository();
};

const getActiveBanners = async () => {
  return await getActiveBannersRepository();
};

const getBannerById = async (id) => {
  const banner = await getBannerByIdRepository(id);

  if (!banner) {
    const error = new Error("Banner no encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return banner;
};

const updateBanner = async (id, data) => {
  await getBannerById(id);

  return await updateBannerRepository(id, data);
};

const deleteBanner = async (id) => {
  await getBannerById(id);

  return await deleteBannerRepository(id);
};

export {
  createBanner,
  getBanners,
  getActiveBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};