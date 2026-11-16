import {
  findPaymentByOrderId,
  createPayment,
  updatePayment,
} from "../repositories/payment.repository.js";

import prisma from "../lib/prisma.js";

const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

const PAYMENT_METHODS = [
  "MERCADO_PAGO",
  "PAYPAL",
  "CASH",
  "BANK_TRANSFER",
];

export async function getPaymentService(orderId, user) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      userId: true,
    },
  });

  if (!order) {
    throw new Error("Pago no encontrado.");
  }

  if (
    user?.role === "CUSTOMER" &&
    order.userId !== user.id
  ) {
    throw new Error(
      "No tienes permisos para ver este pago."
    );
  }

  const payment = await findPaymentByOrderId(orderId);

  if (!payment) {
    throw new Error("Pago no encontrado.");
  }

  return payment;
}

export async function createPaymentService(data) {
  const amount = Number(data.amount);

  if (
    !data.orderId ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      "Los datos del pago no son válidos."
    );
  }

  if (!PAYMENT_METHODS.includes(data.method)) {
    throw new Error("Método de pago inválido.");
  }

  const exists = await findPaymentByOrderId(
    data.orderId
  );

  if (exists) {
    throw new Error("El pedido ya tiene un pago.");
  }

  return await createPayment({
    orderId: data.orderId,
    amount,
    method: data.method,
    status: "PENDING",
    transactionId: data.transactionId
      ? String(data.transactionId)
      : null,
  });
}

export async function updatePaymentService(id, data) {
  const updateData = {};

  if (data.status !== undefined) {
    if (!PAYMENT_STATUSES.includes(data.status)) {
      throw new Error("Estado de pago inválido.");
    }

    updateData.status = data.status;
  }

  if (data.method !== undefined) {
    if (!PAYMENT_METHODS.includes(data.method)) {
      throw new Error("Método de pago inválido.");
    }

    updateData.method = data.method;
  }

  if (data.amount !== undefined) {
    const amount = Number(data.amount);

    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("El monto del pago no es válido.");
    }

    updateData.amount = amount;
  }

  if (data.transactionId !== undefined) {
    updateData.transactionId = data.transactionId
      ? String(data.transactionId)
      : null;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  return await updatePayment(id, updateData);
}