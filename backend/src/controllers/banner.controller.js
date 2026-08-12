import {
  createBanner,
  getBanners,
  getActiveBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
} from "../services/banner.service.js";

const createBannerController = async (req, res, next) => {
  try {
    const banner = await createBanner(req.body);

    return res.status(201).json({
      success: true,
      message: "Banner creado correctamente.",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

const getBannersController = async (req, res, next) => {
  try {
    const banners = await getBanners();

    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

const getActiveBannersController = async (req, res, next) => {
  try {
    const banners = await getActiveBanners();

    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

const getBannerByIdController = async (req, res, next) => {
  try {
    const banner = await getBannerById(req.params.id);

    return res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

const updateBannerController = async (req, res, next) => {
  try {
    const banner = await updateBanner(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Banner actualizado correctamente.",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBannerController = async (req, res, next) => {
  try {
    await deleteBanner(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Banner eliminado correctamente.",
    });
  } catch (error) {
    next(error);
  }
};

export {
  createBannerController,
  getBannersController,
  getActiveBannersController,
  getBannerByIdController,
  updateBannerController,
  deleteBannerController,
};