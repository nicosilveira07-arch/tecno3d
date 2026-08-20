import prisma from "../lib/prisma.js";

const getStoreSettingsRepository = async () => {
  return prisma.storeSettings.findFirst();
};

const createStoreSettingsRepository = async (data) => {
  return prisma.storeSettings.create({
    data,
  });
};

const updateStoreSettingsRepository = async (
  id,
  data
) => {
  return prisma.storeSettings.update({
    where: {
      id,
    },
    data,
  });
};

export {
  getStoreSettingsRepository,
  createStoreSettingsRepository,
  updateStoreSettingsRepository,
};