import prisma from "../lib/prisma.js";

export async function findCartByUserId(userId) {
  return await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
              brand: true,
            },
          },
        },
      },
    },
  });
}

export async function createCart(userId) {
  return await prisma.cart.create({
    data: {
      userId,
    },
  });
}

export async function findCartItem(cartId, productId) {
  return await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId,
        productId,
      },
    },
  });
}

export async function addCartItem(data) {
  return await prisma.cartItem.create({
    data,
  });
}

export async function updateCartItem(id, quantity) {
  return await prisma.cartItem.update({
    where: {
      id,
    },
    data: {
      quantity,
    },
  });
}

export async function deleteCartItem(id) {
  return await prisma.cartItem.delete({
    where: {
      id,
    },
  });
}

export async function clearCart(cartId) {
  return await prisma.cartItem.deleteMany({
    where: {
      cartId,
    },
  });
}