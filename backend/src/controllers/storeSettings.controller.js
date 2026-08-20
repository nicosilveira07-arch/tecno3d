import {
  getStoreSettingsService,
  updateStoreSettingsService,
} from "../services/storeSettings.service.js";

const getStoreSettingsController = async (
  req,
  res,
  next
) => {
  try {
    const settings =
      await getStoreSettingsService();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const updateStoreSettingsController = async (
  req,
  res,
  next
) => {
  try {
    const settings =
      await updateStoreSettingsService(
        req.body
      );

    res.json({
      success: true,
      message:
        "Configuración actualizada correctamente.",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getStoreSettingsController,
  updateStoreSettingsController,
};