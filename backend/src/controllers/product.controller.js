import {
  createProductService,
  getProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from "../services/product.service.js";

import { productSchema } from "../validators/product.validator.js";
import { updateProductSchema } from "../validators/update-product.validator.js";
import { productQuerySchema } from "../validators/product-query.validator.js";

const createProductController = async (req, res, next) => {
  try {
    const validatedData = productSchema.parse(req.body);

    const product = await createProductService({
      ...validatedData,
      ownerId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Producto creado correctamente.",
      data: product,
    });

  } catch (error) {
    next(error);
  }
};


const getProductsController = async (req, res, next) => {
  try {
    const query = productQuerySchema.parse(req.query);

    const result = await getProductsService(query);

    res.json({
      success: true,
      data: result.products,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        pages: Math.ceil(result.total / query.limit),
      },
    });

  } catch (error) {
    next(error);
  }
};


const getProductByIdController = async (req, res, next) => {
  try {
    const product = await getProductByIdService(req.params.id);

    res.json({
      success: true,
      data: product,
    });

  } catch (error) {
    next(error);
  }
};


const updateProductController = async (req, res, next) => {
  try {
    const validatedData = updateProductSchema.parse(req.body);

    const product = await updateProductService(
      req.params.id,
      validatedData
    );

    res.json({
      success: true,
      message: "Producto actualizado correctamente.",
      data: product,
    });

  } catch (error) {
    next(error);
  }
};


const deleteProductController = async (req, res, next) => {
  try {
    await deleteProductService(req.params.id);

    res.json({
      success: true,
      message: "Producto eliminado correctamente.",
    });

  } catch (error) {
    next(error);
  }
};


export {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
};