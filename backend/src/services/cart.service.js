import {
  findCartByUserId,
  createCart,
  findCartItem,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  clearCart,
} from "../repositories/cart.repository.js";

import { getProductByIdForOrder } from "../repositories/product.repository.js";

export async function getCartService(userId) {
  let cart = await findCartByUserId(userId);

  if (!cart) {
    await createCart(userId);
    cart = await findCartByUserId(userId);
  }

  return cart;
}

export async function addToCartService(userId, productId, quantity) {
  let cart = await findCartByUserId(userId);

  if (!cart) {
    cart = await createCart(userId);
  }

  const product = await getProductByIdForOrder(productId);

  if (!product) {
    throw new Error("Producto no encontrado.");
  }

  if (product.stock < quantity) {
    throw new Error("Stock insuficiente.");
  }

  const item = await findCartItem(cart.id, productId);

  if (item) {
    return await updateCartItem(
      item.id,
      item.quantity + quantity
    );
  }

  return await addCartItem({
    cartId: cart.id,
    productId,
    quantity,
  });
}

export async function removeFromCartService(userId, productId) {
  const cart = await getCartService(userId);

  const item = await findCartItem(cart.id, productId);

  if (!item) {
    throw new Error("Producto no encontrado en el carrito.");
  }

  return await deleteCartItem(item.id);
}

export async function clearCartService(userId) {
  const cart = await getCartService(userId);

  return await clearCart(cart.id);
}