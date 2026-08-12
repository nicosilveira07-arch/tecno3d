import {
  findPaymentByOrderId,
  createPayment,
  updatePayment,
} from "../repositories/payment.repository.js";


export async function getPaymentService(orderId) {
  const payment = await findPaymentByOrderId(orderId);

  if (!payment) {
    throw new Error("Pago no encontrado.");
  }

  return payment;
}


export async function createPaymentService(data) {
  const exists = await findPaymentByOrderId(
    data.orderId
  );

  if (exists) {
    throw new Error("El pedido ya tiene un pago.");
  }

  return await createPayment({
    ...data,
    status: "PENDING",
  });
}


export async function updatePaymentService(id, data) {
  return await updatePayment(id, data);
}