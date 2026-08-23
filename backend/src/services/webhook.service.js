import { Payment } from "mercadopago";

import client from "../integrations/mercadopago/mercadopago.client.js";

import {
  findPaymentByOrderId,
  updatePayment,
} from "../repositories/payment.repository.js";

import {
  updateOrderStatus,
  getOrderById,
} from "../repositories/order.repository.js";

import {
  decreaseStock,
} from "../repositories/product.repository.js";


const paymentClient = new Payment(client);



export async function processMercadoPagoWebhookService(data) {
  console.log(
    "WEBHOOK MERCADO PAGO:",
    JSON.stringify(data, null, 2)
  );


  // =========================================================
  // IDENTIFICAR TIPO DE NOTIFICACIÓN
  // =========================================================

  const topic =
    data?.type ||
    data?.topic;


  // =========================================================
  // MERCADO PAGO PUEDE ENVIAR MERCHANT_ORDER
  // =========================================================
  // Para Checkout Pro no necesitamos procesarlo.
  // El evento PAYMENT contiene el ID real del pago y es
  // suficiente para actualizar nuestro sistema.
  //
  // Lo ignoramos correctamente y respondemos 200 desde
  // el controller para evitar reintentos innecesarios.
  // =========================================================

  if (
    topic === "merchant_order"
  ) {
    console.log(
      "MERCHANT_ORDER RECIBIDO - SE IGNORA. ESPERAMOS PAYMENT."
    );

    return true;
  }


  // =========================================================
  // SOLO PROCESAR PAYMENT
  // =========================================================

  if (
    topic !== "payment"
  ) {
    console.log(
      `WEBHOOK IGNORADO - TIPO NO SOPORTADO: ${topic}`
    );

    return true;
  }


  // =========================================================
  // OBTENER ID DEL PAGO
  // =========================================================

  const paymentId =
    data?.data?.id;


  if (!paymentId) {
    console.warn(
      "WEBHOOK PAYMENT SIN data.id - SE IGNORA."
    );

    return true;
  }


  console.log(
    "PAYMENT ID OBTENIDO:",
    paymentId
  );


  // =========================================================
  // CONSULTAR PAGO DIRECTAMENTE EN MERCADO PAGO
  // =========================================================
  // Nunca confiamos en el estado enviado por el webhook.
  // Consultamos el recurso directamente a Mercado Pago.
  // =========================================================

  const paymentMP =
    await paymentClient.get({
      id: paymentId,
    });


  console.log(
    "ESTADO MP:",
    paymentMP.status
  );


  // =========================================================
  // OBTENER ORDER ID
  // =========================================================

  const orderId =
    paymentMP.external_reference;


  console.log(
    "ORDER ID:",
    orderId
  );


  if (!orderId) {
    console.warn(
      "El pago de Mercado Pago no tiene external_reference."
    );

    return true;
  }


  // =========================================================
  // BUSCAR PAGO INTERNO
  // =========================================================

  const payment =
    await findPaymentByOrderId(
      orderId
    );


  console.log(
    "PAGO INTERNO ENCONTRADO:",
    JSON.stringify(
      payment,
      null,
      2
    )
  );


  if (!payment) {
    console.warn(
      "Pago interno no encontrado."
    );

    return true;
  }


  // =========================================================
  // EVITAR PROCESAMIENTO DUPLICADO
  // =========================================================

  if (
    payment.status === "PAID" &&
    payment.transactionId ===
      String(paymentMP.id)
  ) {
    console.log(
      "WEBHOOK DUPLICADO: pago ya procesado."
    );

    return true;
  }


  // =========================================================
  // DETERMINAR ESTADO INTERNO
  // =========================================================

  let paymentStatus =
    "PENDING";


  if (
    paymentMP.status === "approved"
  ) {
    paymentStatus =
      "PAID";
  }


  if (
    paymentMP.status === "rejected" ||
    paymentMP.status === "cancelled"
  ) {
    paymentStatus =
      "FAILED";
  }


  // =========================================================
  // ACTUALIZAR PAGO
  // =========================================================

  await updatePayment(
    payment.id,
    {
      status: paymentStatus,

      transactionId:
        String(paymentMP.id),
    }
  );


  // =========================================================
  // PAGO APROBADO
  // =========================================================

  if (
    paymentMP.status === "approved"
  ) {
    console.log(
      "ACTUALIZANDO PEDIDO A CONFIRMED"
    );


    // =======================================================
    // EVITAR VOLVER A CONFIRMAR EL PEDIDO
    // =======================================================

    const order =
      await getOrderById(
        orderId
      );


    if (!order) {
      console.warn(
        "Pedido no encontrado para el pago aprobado."
      );

      return true;
    }


    if (
      order.status !== "CONFIRMED"
    ) {
      await updateOrderStatus(
        orderId,
        "CONFIRMED"
      );
    }


    // =======================================================
    // DESCONTAR STOCK UNA SOLA VEZ
    // =======================================================
    // Si el pago ya estaba PAID antes de este webhook,
    // no volvemos a descontar stock.
    // =======================================================

    const wasAlreadyPaid =
      payment.status === "PAID";


    if (!wasAlreadyPaid) {
      for (
        const item of order.items
      ) {
        await decreaseStock(
          item.productId,
          item.quantity
        );
      }
    }
  }


  console.log(
    "WEBHOOK MERCADO PAGO PROCESADO CORRECTAMENTE."
  );


  return true;
}

