import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../repositories/product.repository.js";


const createProductService = async (data) => {
  return await createProduct(data);
};


const getProductsService = async (params) => {
  return await getProducts(params);
};


const getProductByIdService = async (id) => {
  return await getProductById(id);
};


const updateProductService = async (id, data) => {
  return await updateProduct(id, data);
};


const deleteProductService = async (id) => {
  return await deleteProduct(id);
};


export {
  createProductService,
  getProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
};