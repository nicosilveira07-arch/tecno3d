import {
  createMercadoPagoPreference,
} from "../integrations/mercadopago/mercadopago.service.js";

import {
  getOrderById,
} from "../repositories/order.repository.js";

import {
  findPaymentByOrderId,
  createPayment,
} from "../repositories/payment.repository.js";

export async function createOrderPaymentService(orderId) {
  const order = await getOrderById(orderId);

  if (!order) {
    throw new Error("Pedido no encontrado.");
  }

  const existingPayment = await findPaymentByOrderId(orderId);

  if (
    existingPayment &&
    existingPayment.status !== "FAILED"
  ) {
    throw new Error("El pedido ya tiene un pago.");
  }

  const items = order.items.map((item) => ({
    title: item.product.name,
    quantity: item.quantity,
    unit_price: item.price,
    currency_id: "UYU",
  }));

  const preference = await createMercadoPagoPreference({
    orderId,
    items,
  });

  const payment = await createPayment({
    orderId,
    amount: order.total,
    status: "PENDING",
    method: "MERCADO_PAGO",
  });

  return {
    payment,
    preferenceId: preference.id,
    initPoint: preference.init_point,
    sandboxInitPoint: preference.sandbox_init_point,
  };
}

