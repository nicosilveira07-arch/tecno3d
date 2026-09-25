import { useSyncExternalStore } from "react";

import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearServerCart,
} from "../../services/cart.api";

const BASE_STORAGE_KEY = "tecno3d_cart";

const CART_SYNC_INTERVAL = 7000;

const listeners = new Set();

let syncInterval = null;
let eventsInitialized = false;

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

let cart =
  loadLocalCart();

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

// ======================================================
// NORMALIZAR CARRITO DEL BACKEND
// ======================================================

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

      const variant =
        item.variant ||
        null;

      return {
        productId:
          item.productId,

        variantId:
          item.variantId ||
          null,

        variantName:
          variant?.name ||
          null,

        variantColorHex:
          variant?.colorHex ||
          null,

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
          variant?.images?.[0]
            ?.url ||
          product?.image ||
          product?.mainImage ||
          "",

        quantity:
          item.quantity,
      };
    }
  );
}

// ======================================================
// CARGAR CARRITO DEL USUARIO
// ======================================================

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

// ======================================================
// SINCRONIZACIÓN AUTOMÁTICA
// ======================================================
//
// Mantiene sincronizado el carrito entre:
//
// PC ↔ celular
// PC ↔ otra PC
// celular ↔ otra pestaña
//
// No reemplaza la actualización inmediata.
// Solamente vuelve a consultar el backend
// periódicamente para detectar cambios realizados
// desde otro dispositivo.
//
// Además:
// - sincroniza al volver a la pestaña
// - sincroniza cuando la ventana recupera el foco
// ======================================================

function startCartSync() {
  if (
    typeof window ===
      "undefined"
  ) {
    return;
  }

  if (
    eventsInitialized
  ) {
    return;
  }

  eventsInitialized = true;

  const sync = () => {
    const userId =
      getUserId();

    if (!userId) {
      return;
    }

    loadUserCart();
  };

  // ====================================================
  // CADA 15 SEGUNDOS
  // ====================================================

  syncInterval =
    window.setInterval(
      sync,
      CART_SYNC_INTERVAL
    );

  // ====================================================
  // AL VOLVER A LA PESTAÑA
  // ====================================================

  document.addEventListener(
    "visibilitychange",
    () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        sync();
      }
    }
  );

  // ====================================================
  // AL VOLVER A LA VENTANA
  // ====================================================

  window.addEventListener(
    "focus",
    sync
  );
}

startCartSync();

// ======================================================
// VACIAR CARRITO
// ======================================================

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

// ======================================================
// AGREGAR AL CARRITO
// ======================================================
//
// variant = null
// → producto base / sin color
//
// variant = objeto
// → variante seleccionada
// ======================================================

export async function addToCart(
  product,
  variant = null
) {
  const productId =
    product.productId ??
    product.id;

  const variantId =
    variant?.id ||
    null;

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

  // ==================================================
  // BUSCAR PRODUCTO + MISMA VARIANTE
  // ==================================================

  const existingProduct =
    cart.find(
      (item) =>
        item.productId ===
          productId &&
        (item.variantId ||
          null) ===
          variantId
    );

  if (
    existingProduct
  ) {
    cart =
      cart.map(
        (item) =>
          item.productId ===
            productId &&
          (item.variantId ||
            null) ===
            variantId
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

        variantId,

        variantName:
          variant?.name ||
          null,

        variantColorHex:
          variant?.colorHex ||
          null,

        name:
          product.name,

        price:
          effectivePrice,

        image:
          variant?.images?.[0]
            ?.url ||
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
      1,
      variantId
    );
  } catch (error) {
    console.error(
      "Error agregando producto al carrito del servidor:",
      error
    );

    await loadUserCart();
  }
}

// ======================================================
// DISMINUIR CANTIDAD
// ======================================================

export async function decreaseQuantity(
  productId,
  variantId = null
) {
  const existingProduct =
    cart.find(
      (item) =>
        item.productId ===
          productId &&
        (item.variantId ||
          null) ===
          variantId
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
          !(
            item.productId ===
              productId &&
            (item.variantId ||
              null) ===
              variantId
          )
      );
  } else {
    cart =
      cart.map(
        (item) =>
          item.productId ===
            productId &&
          (item.variantId ||
            null) ===
            variantId
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
        productId,
        variantId
      );
    } else {
      await updateCartItem(
        productId,
        newQuantity,
        variantId
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

// ======================================================
// ELIMINAR DEL CARRITO
// ======================================================

export async function removeFromCart(
  productId,
  variantId = null
) {
  cart =
    cart.filter(
      (item) =>
        !(
          item.productId ===
            productId &&
          (item.variantId ||
            null) ===
            variantId
        )
    );

  notifyListeners();

  const userId =
    getUserId();

  if (!userId) {
    return;
  }

  try {
    await removeCartItem(
      productId,
      variantId
    );
  } catch (error) {
    console.error(
      "Error eliminando producto del carrito del servidor:",
      error
    );

    await loadUserCart();
  }
}

// ======================================================
// HOOK
// ======================================================

export function useCart() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );
}
