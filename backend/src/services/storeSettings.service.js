import {
  getStoreSettingsRepository,
  createStoreSettingsRepository,
  updateStoreSettingsRepository,
} from "../repositories/storeSettings.repository.js";

const getStoreSettingsService = async () => {
  return getStoreSettingsRepository();
};

const updateStoreSettingsService = async (data) => {
  const currentSettings =
    await getStoreSettingsRepository();

  if (!currentSettings) {
    return createStoreSettingsRepository(data);
  }

  return updateStoreSettingsRepository(
    currentSettings.id,
    data
  );
};

export {
  getStoreSettingsService,
  updateStoreSettingsService,
};