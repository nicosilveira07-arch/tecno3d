import { useSyncExternalStore } from "react";

import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearServerCart,
} from "../../services/cart.api";

const BASE_STORAGE_KEY = "tecno3d_cart";

let cart = [];

const listeners = new Set();

function getUserId() {
  const storedUser =
    localStorage.getItem("user");

  if (
    !storedUser ||
    storedUser === "undefined"
  ) {
    return null;
  }

  try {
    const user =
      JSON.parse(storedUser);

    return user?.id || null;
  } catch {
    return null;
  }
}

function getStorageKey() {
  const userId =
    getUserId();

  if (!userId) {
    return null;
  }

  return `${BASE_STORAGE_KEY}_${userId}`;
}

function loadLocalCart() {
  const storageKey =
    getStorageKey();

  if (!storageKey) {
    return [];
  }

  try {
    return JSON.parse(
      localStorage.getItem(
        storageKey
      ) || "[]"
    );
  } catch {
    return [];
  }
}

function saveLocalCart() {
  const storageKey =
    getStorageKey();

  if (!storageKey) {
    return;
  }

  localStorage.setItem(
    storageKey,
    JSON.stringify(cart)
  );
}

function notifyListeners() {
  saveLocalCart();

  listeners.forEach(
    (listener) => {
      listener();
    }
  );
}

function subscribe(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return cart;
}

function normalizeBackendCart(
  backendCart
) {
  if (
    !backendCart ||
    !Array.isArray(
      backendCart.items
    )
  ) {
    return [];
  }

  return backendCart.items.map(
    (item) => {
      const product =
        item.product;

      return {
        productId:
          item.productId,

        name:
          product?.name ||
          "Producto",

        price:
          Number(
            product?.price ??
              item.price ??
              0
          ),

        image:
          product?.image ||
          product?.mainImage ||
          "",

        quantity:
          item.quantity,
      };
    }
  );
}

export async function loadUserCart() {
  const userId =
    getUserId();

  if (!userId) {
    cart = [];

    notifyListeners();

    return;
  }

  try {
    const response =
      await getCart();

    const backendCart =
      response.data?.data;

    cart =
      normalizeBackendCart(
        backendCart
      );

    notifyListeners();
  } catch (error) {
    console.error(
      "Error cargando carrito:",
      error
    );

    cart =
      loadLocalCart();

    notifyListeners();
  }
}

export async function clearCart() {
  const userId =
    getUserId();

  cart = [];

  notifyListeners();

  if (!userId) {
    return;
  }

  try {
    await clearServerCart();
  } catch (error) {
    console.error(
      "Error vaciando carrito del servidor:",
      error
    );
  }
}

export async function addToCart(
  product
) {
  const productId =
    product.productId ??
    product.id;

  const originalPrice =
    Number(product.price);

  const offerPrice =
    product.offerActive &&
    product.offerPrice != null
      ? Number(
          product.offerPrice
        )
      : null;

  const effectivePrice =
    offerPrice != null &&
    offerPrice > 0 &&
    offerPrice <
      originalPrice
      ? offerPrice
      : originalPrice;

  const existingProduct =
    cart.find(
      (item) =>
        item.productId ===
        productId
    );

  if (
    existingProduct
  ) {
    cart =
      cart.map(
        (item) =>
          item.productId ===
          productId
            ? {
                ...item,
                quantity:
                  item.quantity +
                  1,
                price:
                  effectivePrice,
              }
            : item
      );
  } else {
    cart = [
      ...cart,
      {
        productId,
        name:
          product.name,
        price:
          effectivePrice,
        image:
          product.image,
        quantity: 1,
      },
    ];
  }

  notifyListeners();

  const userId =
    getUserId();

  if (!userId) {
    return;
  }

  try {
    await addCartItem(
      productId,
      1
    );
  } catch (error) {
    console.error(
      "Error agregando producto al carrito del servidor:",
      error
    );

    await loadUserCart();
  }
}

export async function decreaseQuantity(
  productId
) {
  const existingProduct =
    cart.find(
      (item) =>
        item.productId ===
        productId
    );

  if (
    !existingProduct
  ) {
    return;
  }

  const newQuantity =
    existingProduct.quantity -
    1;

  if (
    newQuantity <= 0
  ) {
    cart =
      cart.filter(
        (item) =>
          item.productId !==
          productId
      );
  } else {
    cart =
      cart.map(
        (item) =>
          item.productId ===
          productId
            ? {
                ...item,
                quantity:
                  newQuantity,
              }
            : item
      );
  }

  notifyListeners();

  const userId =
    getUserId();

  if (!userId) {
    return;
  }

  try {
    if (
      newQuantity <= 0
    ) {
      await removeCartItem(
        productId
      );
    } else {
      await updateCartItem(
        productId,
        newQuantity
      );
    }
  } catch (error) {
    console.error(
      "Error actualizando cantidad del carrito:",
      error
    );

    await loadUserCart();
  }
}

export async function removeFromCart(
  productId
) {
  cart =
    cart.filter(
      (item) =>
        item.productId !==
        productId
    );

  notifyListeners();

  const userId =
    getUserId();

  if (!userId) {
    return;
  }

  try {
    await removeCartItem(
      productId
    );
  } catch (error) {
    console.error(
      "Error eliminando producto del carrito del servidor:",
      error
    );

    await loadUserCart();
  }
}

export function useCart() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );
}

