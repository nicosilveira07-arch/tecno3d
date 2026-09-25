import {
  getCartService,
  addToCartService,
  updateCartItemService,
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
    const {
      productId,
      quantity,
      variantId,
    } = addToCartSchema.parse(req.body);

    const item = await addToCartService(
      req.user.id,
      productId,
      quantity,
      variantId
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

export async function updateCartItemController(
  req,
  res
) {
  try {
    const quantity = Number(
      req.body.quantity
    );

    const variantId =
      req.body.variantId || null;

    if (
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "La cantidad debe ser un número entero mayor o igual a 0.",
      });
    }

    const item =
      await updateCartItemService(
        req.user.id,
        req.params.productId,
        quantity,
        variantId
      );

    return res.json({
      success: true,
      message:
        "Cantidad del producto actualizada.",
      data: item,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function removeFromCartController(
  req,
  res
) {
  try {
    const variantId =
      req.body?.variantId || null;

    await removeFromCartService(
      req.user.id,
      req.params.productId,
      variantId
    );

    return res.json({
      success: true,
      message:
        "Producto eliminado del carrito.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function clearCartController(
  req,
  res
) {
  try {
    await clearCartService(
      req.user.id
    );

    return res.json({
      success: true,
      message:
        "Carrito vaciado correctamente.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error.message,
    });
  }
}

