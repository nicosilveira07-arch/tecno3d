import {
  findCartByUserId,
  createCart,
  findCartItem,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  clearCart,
} from "../repositories/cart.repository.js";

import {
  getProductByIdForOrder,
} from "../repositories/product.repository.js";

export async function getCartService(
  userId
) {
  let cart =
    await findCartByUserId(
      userId
    );

  if (!cart) {
    await createCart(userId);

    cart =
      await findCartByUserId(
        userId
      );
  }

  return cart;
}

// ======================================================
// AGREGAR AL CARRITO
// ======================================================

export async function addToCartService(
  userId,
  productId,
  quantity,
  variantId = null
) {
  let cart =
    await findCartByUserId(
      userId
    );

  if (!cart) {
    cart =
      await createCart(
        userId
      );
  }

  const product =
    await getProductByIdForOrder(
      productId
    );

  if (!product) {
    throw new Error(
      "Producto no encontrado."
    );
  }

  let availableStock =
    product.stock;

  // ==================================================
  // VALIDAR VARIANTE
  // ==================================================

  if (variantId) {
    if (!product.hasVariants) {
      throw new Error(
        "El producto no utiliza variantes."
      );
    }

    const variant =
      product.variants?.find(
        (item) =>
          item.id ===
          variantId
      );

    if (!variant) {
      throw new Error(
        "La variante seleccionada no existe."
      );
    }

    availableStock =
      variant.stock;
  }

  if (
    availableStock <
    quantity
  ) {
    throw new Error(
      "Stock insuficiente."
    );
  }

  // ==================================================
  // BUSCAR PRODUCTO + VARIANTE
  // ==================================================

  const item =
    await findCartItem(
      cart.id,
      productId,
      variantId
    );

  if (item) {
    const newQuantity =
      item.quantity +
      quantity;

    if (
      availableStock <
      newQuantity
    ) {
      throw new Error(
        "Stock insuficiente."
      );
    }

    return await updateCartItem(
      item.id,
      newQuantity
    );
  }

  // ==================================================
  // CREAR NUEVA LÍNEA
  // ==================================================

  return await addCartItem({
    cartId:
      cart.id,

    productId,

    variantId:
      variantId || null,

    quantity,
  });
}

// ======================================================
// ACTUALIZAR CANTIDAD
// ======================================================

export async function updateCartItemService(
  userId,
  productId,
  quantity,
  variantId = null
) {
  const cart =
    await getCartService(
      userId
    );

  const item =
    await findCartItem(
      cart.id,
      productId,
      variantId
    );

  if (!item) {
    throw new Error(
      "Producto no encontrado en el carrito."
    );
  }

  if (
    quantity === 0
  ) {
    return await deleteCartItem(
      item.id
    );
  }

  const product =
    await getProductByIdForOrder(
      productId
    );

  if (!product) {
    throw new Error(
      "Producto no encontrado."
    );
  }

  let availableStock =
    product.stock;

  // ==================================================
  // VALIDAR STOCK DE VARIANTE
  // ==================================================

  if (variantId) {
    if (!product.hasVariants) {
      throw new Error(
        "El producto no utiliza variantes."
      );
    }

    const variant =
      product.variants?.find(
        (item) =>
          item.id ===
          variantId
      );

    if (!variant) {
      throw new Error(
        "La variante seleccionada no existe."
      );
    }

    availableStock =
      variant.stock;
  }

  if (
    availableStock <
    quantity
  ) {
    throw new Error(
      "Stock insuficiente."
    );
  }

  return await updateCartItem(
    item.id,
    quantity
  );
}

// ======================================================
// ELIMINAR DEL CARRITO
// ======================================================

export async function removeFromCartService(
  userId,
  productId,
  variantId = null
) {
  const cart =
    await getCartService(
      userId
    );

  const item =
    await findCartItem(
      cart.id,
      productId,
      variantId
    );

  if (!item) {
    throw new Error(
      "Producto no encontrado en el carrito."
    );
  }

  return await deleteCartItem(
    item.id
  );
}

// ======================================================
// VACIAR CARRITO
// ======================================================

export async function clearCartService(
  userId
) {
  const cart =
    await getCartService(
      userId
    );

  return await clearCart(
    cart.id
  );
}

