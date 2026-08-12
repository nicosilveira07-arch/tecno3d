import { useSyncExternalStore } from "react";

const BASE_STORAGE_KEY = "tecno3d_cart";

let cart = [];

const listeners = new Set();

function getUserId() {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  return user?.id || null;
}

function getStorageKey() {
  const userId = getUserId();

  if (!userId) {
    return null;
  }

  return `${BASE_STORAGE_KEY}_${userId}`;
}

function loadCart() {
  const storageKey = getStorageKey();

  if (!storageKey) {
    return [];
  }

  try {
    return JSON.parse(
      localStorage.getItem(storageKey) || "[]"
    );
  } catch {
    return [];
  }
}

cart = loadCart();

function saveCart() {
  const storageKey = getStorageKey();

  if (!storageKey) {
    return;
  }

  localStorage.setItem(
    storageKey,
    JSON.stringify(cart)
  );
}

function emitChange() {
  saveCart();

  listeners.forEach((listener) => {
    listener();
  });
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

export function loadUserCart() {
  cart = loadCart();

  listeners.forEach((listener) => {
    listener();
  });
}

export function clearCart() {
  cart = [];

  emitChange();
}

export function addToCart(product) {
  const productId =
    product.productId ?? product.id;

  const existingProduct = cart.find(
    (item) => item.productId === productId
  );

  if (existingProduct) {
    cart = cart.map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );
  } else {
    cart = [
      ...cart,
      {
        productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      },
    ];
  }

  emitChange();
}

export function decreaseQuantity(productId) {
  const existingProduct = cart.find(
    (item) => item.productId === productId
  );

  if (!existingProduct) {
    return;
  }

  if (existingProduct.quantity === 1) {
    cart = cart.filter(
      (item) => item.productId !== productId
    );
  } else {
    cart = cart.map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity: item.quantity - 1,
          }
        : item
    );
  }

  emitChange();
}

export function removeFromCart(productId) {
  cart = cart.filter(
    (item) => item.productId !== productId
  );

  emitChange();
}

export function useCart() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );
}