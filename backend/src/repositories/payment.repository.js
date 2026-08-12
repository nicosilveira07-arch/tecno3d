import prisma from "../lib/prisma.js";


export async function findPaymentByOrderId(orderId) {
  return await prisma.payment.findUnique({
    where: {
      orderId,
    },
  });
}


export async function createPayment(data) {
  return await prisma.payment.create({
    data,
  });
}


export async function updatePayment(id, data) {
  return await prisma.payment.update({
    where: {
      id,
    },
    data,
  });
}

