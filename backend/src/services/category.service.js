import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../repositories/category.repository.js";


const createCategoryService = async (data) => {
  return await createCategory(data);
};


const getCategoriesService = async () => {
  return await getCategories();
};


const getCategoryByIdService = async (id) => {
  return await getCategoryById(id);
};


const updateCategoryService = async (id, data) => {
  return await updateCategory(id, data);
};


const deleteCategoryService = async (id) => {
  return await deleteCategory(id);
};


export {
  createCategoryService,
  getCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService,
};