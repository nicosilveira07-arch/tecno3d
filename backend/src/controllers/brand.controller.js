import {
  getAllBrandsService,
  getBrandByIdService,
  createBrandService,
  updateBrandService,
  deleteBrandService,
} from "../services/brand.service.js";

import {
  createBrandSchema,
  updateBrandSchema,
} from "../validators/brand.validator.js";

export async function getAllBrandsController(req, res) {
  try {
    const brands = await getAllBrandsService();

    return res.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getBrandByIdController(req, res) {
  try {
    const brand = await getBrandByIdService(req.params.id);

    return res.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function createBrandController(req, res) {
  try {
    const data = createBrandSchema.parse(req.body);

    const brand = await createBrandService(data);

    return res.status(201).json({
      success: true,
      message: "Marca creada correctamente.",
      data: brand,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateBrandController(req, res) {
  try {
    const data = updateBrandSchema.parse(req.body);

    const brand = await updateBrandService(req.params.id, data);

    return res.json({
      success: true,
      message: "Marca actualizada correctamente.",
      data: brand,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteBrandController(req, res) {
  try {
    await deleteBrandService(req.params.id);

    return res.json({
      success: true,
      message: "Marca eliminada correctamente.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}