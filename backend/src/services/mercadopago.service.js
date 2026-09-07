import {
  createMercadoPagoPreference,
} from "../integrations/mercadopago/mercadopago.service.js";

import {
  getOrderById,
} from "../repositories/order.repository.js";

import {
  findPaymentByOrderId,
  createPayment,
  updatePayment,
} from "../repositories/payment.repository.js";

export async function createOrderPaymentService(orderId) {
  const order = await getOrderById(orderId);

  if (!order) {
    throw new Error("Pedido no encontrado.");
  }

  // Un pedido confirmado o posterior no debe
  // volver a utilizarse desde el checkout pendiente.

  if (order.status !== "PENDING") {
    throw new Error(
      "Este pedido ya no está pendiente y no puede continuar la compra."
    );
  }

  const existingPayment =
    await findPaymentByOrderId(orderId);

  // Si el pago ya fue confirmado, no permitir
  // generar otro pago.

  if (
    existingPayment &&
    existingPayment.status === "PAID"
  ) {
    throw new Error(
      "El pedido ya tiene el pago confirmado."
    );
  }

  const items = [
    {
      title: `Pedido TECNO 3D #${order.id}`,
      quantity: 1,
      unit_price: Number(order.total),
      currency_id: "UYU",
    },
  ];

  // Crear una nueva preferencia de Mercado Pago
  // para el mismo pedido.

  const preference =
    await createMercadoPagoPreference({
      orderId,
      items,
    });

  let payment;

  // Si ya existe un pago PENDING o FAILED,
  // reutilizar el mismo registro.

  if (existingPayment) {
    payment = await updatePayment(
      existingPayment.id,
      {
        amount: Number(order.total),
        status: "PENDING",
        method: "MERCADO_PAGO",
        transactionId: null,
      }
    );
  } else {
    payment = await createPayment({
      orderId,
      amount: Number(order.total),
      status: "PENDING",
      method: "MERCADO_PAGO",
    });
  }

  return {
    payment,
    preferenceId: preference.id,
    initPoint: preference.init_point,
    sandboxInitPoint: preference.sandbox_init_point,
  };
}

