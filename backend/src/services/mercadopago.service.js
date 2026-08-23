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

  const existingPayment =
    await findPaymentByOrderId(orderId);

  if (
    existingPayment &&
    existingPayment.status !== "FAILED"
  ) {
    throw new Error("El pedido ya tiene un pago.");
  }

  /*
   * IMPORTANTE:
   *
   * order.total ya contiene el descuento del cupón.
   *
   * Ejemplo:
   *
   * Subtotal: 49.99
   * Descuento: 5.00
   * Total: 44.99
   *
   * Mercado Pago debe recibir 44.99.
   */

  const items = [
    {
      title: `Pedido TECNO 3D #${order.id}`,
      quantity: 1,
      unit_price: Number(order.total),
      currency_id: "UYU",
    },
  ];

  const preference =
    await createMercadoPagoPreference({
      orderId,
      items,
    });

  const payment = await createPayment({
    orderId,
    amount: Number(order.total),
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