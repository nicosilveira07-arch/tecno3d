import {
  createCategoryService,
  getCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService,
} from "../services/category.service.js";

import { categorySchema } from "../validators/category.validator.js";
import { updateCategorySchema } from "../validators/update-category.validator.js";


const createCategoryController = async (req, res, next) => {
  try {
    const validatedData = categorySchema.parse(req.body);

    const category = await createCategoryService(validatedData);

    res.status(201).json({
      success: true,
      message: "Categoría creada correctamente.",
      data: category,
    });

  } catch (error) {
    next(error);
  }
};


const getCategoriesController = async (req, res, next) => {
  try {
    const categories = await getCategoriesService();

    res.json({
      success: true,
      data: categories,
    });

  } catch (error) {
    next(error);
  }
};


const getCategoryByIdController = async (req, res, next) => {
  try {
    const category = await getCategoryByIdService(req.params.id);

    res.json({
      success: true,
      data: category,
    });

  } catch (error) {
    next(error);
  }
};


const updateCategoryController = async (req, res, next) => {
  try {
    const validatedData = updateCategorySchema.parse(req.body);

    const category = await updateCategoryService(
      req.params.id,
      validatedData
    );

    res.json({
      success: true,
      message: "Categoría actualizada correctamente.",
      data: category,
    });

  } catch (error) {
    next(error);
  }
};


const deleteCategoryController = async (req, res, next) => {
  try {
    await deleteCategoryService(req.params.id);

    res.json({
      success: true,
      message: "Categoría eliminada correctamente.",
    });

  } catch (error) {
    next(error);
  }
};


export {
  createCategoryController,
  getCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
};