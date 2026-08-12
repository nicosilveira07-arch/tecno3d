import {
  findAllBrands,
  findBrandById,
  findBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../repositories/brand.repository.js";

export async function getAllBrandsService() {
  return await findAllBrands();
}

export async function getBrandByIdService(id) {
  const brand = await findBrandById(id);

  if (!brand) {
    throw new Error("Marca no encontrada.");
  }

  return brand;
}

export async function createBrandService(data) {
  const exists = await findBrandBySlug(data.slug);

  if (exists) {
    throw new Error("Ya existe una marca con ese slug.");
  }

  return await createBrand(data);
}

export async function updateBrandService(id, data) {
  await getBrandByIdService(id);

  if (data.slug) {
    const exists = await findBrandBySlug(data.slug);

    if (exists && exists.id !== id) {
      throw new Error("Ya existe una marca con ese slug.");
    }
  }

  return await updateBrand(id, data);
}

export async function deleteBrandService(id) {
  await getBrandByIdService(id);

  return await deleteBrand(id);
}