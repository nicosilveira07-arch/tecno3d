import prisma from "../lib/prisma.js";

export async function findCartForCheckout(userId) {
  return await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}


export async function findAddressById(id, userId) {
  return await prisma.address.findFirst({
    where: {
      id,
      userId,
    },
  });
}


export async function createOrder(data) {
  return await prisma.order.create({
    data,
  });
}


export async function createOrderItems(items) {
  return await prisma.orderItem.createMany({
    data: items,
  });
}


export async function decreaseProductStock(productId, quantity) {
  return await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      stock: {
        decrement: quantity,
      },
    },
  });
}


export async function clearUserCart(cartId) {
  return await prisma.cartItem.deleteMany({
    where: {
      cartId,
    },
  });
}