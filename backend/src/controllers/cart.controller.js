import {
  getCartService,
  addToCartService,
  removeFromCartService,
  clearCartService,
} from "../services/cart.service.js";

import { addToCartSchema } from "../validators/cart.validator.js";

export async function getCartController(req, res) {
  try {
    const cart = await getCartService(req.user.id);

    return res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function addToCartController(req, res) {
  try {
    const { productId, quantity } = addToCartSchema.parse(req.body);

    const item = await addToCartService(
      req.user.id,
      productId,
      quantity
    );

    return res.status(201).json({
      success: true,
      message: "Producto agregado al carrito.",
      data: item,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function removeFromCartController(req, res) {
  try {
    await removeFromCartService(
      req.user.id,
      req.params.productId
    );

    return res.json({
      success: true,
      message: "Producto eliminado del carrito.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function clearCartController(req, res) {
  try {
    await clearCartService(req.user.id);

    return res.json({
      success: true,
      message: "Carrito vaciado correctamente.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}