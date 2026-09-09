import { Payment } from "mercadopago";

import client from "../integrations/mercadopago/mercadopago.client.js";

import {
  getCheckoutSessionByIdForWebhook,
  updateCheckoutSessionStatus,
  completeCheckoutSessionAsOrder,
} from "../repositories/checkoutSession.repository.js";

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
  // MERCHANT ORDER
  // =========================================================

  if (topic === "merchant_order") {
    console.log(
      "MERCHANT_ORDER RECIBIDO - SE IGNORA. ESPERAMOS PAYMENT."
    );

    return true;
  }

  // =========================================================
  // SOLO PROCESAR PAYMENT
  // =========================================================

  if (topic !== "payment") {
    console.log(
      `WEBHOOK IGNORADO - TIPO NO SOPORTADO: ${topic}`
    );

    return true;
  }

  // =========================================================
  // OBTENER ID DEL PAYMENT
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
  // CONSULTAR PAYMENT DIRECTAMENTE EN MERCADO PAGO
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
  // OBTENER CHECKOUT SESSION ID
  // =========================================================

  const checkoutSessionId =
    paymentMP.external_reference;

  console.log(
    "CHECKOUT SESSION ID:",
    checkoutSessionId
  );

  if (!checkoutSessionId) {
    console.warn(
      "El pago de Mercado Pago no tiene external_reference."
    );

    return true;
  }

  // =========================================================
  // EXTRAER DATOS OFICIALES DEL TICKET
  // =========================================================

  const transactionDetails =
    paymentMP?.transaction_details;

  const paymentReferenceId =
    transactionDetails?.payment_method_reference_id
      ? String(
          transactionDetails.payment_method_reference_id
        )
      : null;

  const paymentVerificationCode =
    transactionDetails?.verification_code
      ? String(
          transactionDetails.verification_code
        )
      : null;

  const paymentInstructionsUrl =
    transactionDetails?.external_resource_url
      ? String(
          transactionDetails.external_resource_url
        )
      : null;

  console.log(
    "DATOS DEL TICKET MERCADO PAGO:"
  );

  console.log(
    "PAYMENT METHOD REFERENCE ID:",
    paymentReferenceId
  );

  console.log(
    "VERIFICATION CODE:",
    paymentVerificationCode
  );

  console.log(
    "EXTERNAL RESOURCE URL:",
    paymentInstructionsUrl
  );

  // =========================================================
  // BUSCAR CHECKOUT SESSION
  // =========================================================

  const session =
    await getCheckoutSessionByIdForWebhook(
      String(checkoutSessionId)
    );

  if (!session) {
    console.warn(
      "CHECKOUT SESSION NO ENCONTRADA:"
    );

    console.warn(
      String(checkoutSessionId)
    );

    return true;
  }

  console.log(
    "CHECKOUT SESSION ENCONTRADA:"
  );

  console.log(
    JSON.stringify(
      session,
      null,
      2
    )
  );

  // =========================================================
  // SESIÓN YA COMPLETADA
  // =========================================================

  if (session.status === "COMPLETED") {
    console.log(
      "WEBHOOK DUPLICADO: CHECKOUT SESSION YA COMPLETADA."
    );

    return true;
  }

  // =========================================================
  // PAYMENT APPROVED
  // =========================================================

  if (paymentMP.status === "approved") {
    console.log(
      "=========================================="
    );

    console.log(
      "PAGO APROBADO - CREANDO ORDER REAL"
    );

    console.log(
      "CHECKOUT SESSION:",
      session.id
    );

    console.log(
      "PAYMENT ID:",
      String(paymentMP.id)
    );

    console.log(
      "=========================================="
    );

    const result =
      await completeCheckoutSessionAsOrder(
        session.id,
        String(paymentMP.id)
      );

    if (result.alreadyCompleted) {
      console.log(
        "CHECKOUT SESSION YA HABÍA SIDO COMPLETADA."
      );

      return true;
    }

    console.log(
      "ORDER REAL CREADO CORRECTAMENTE:"
    );

    console.log(
      JSON.stringify(
        result.order,
        null,
        2
      )
    );

    console.log(
      "WEBHOOK PAYMENT APROBADO PROCESADO."
    );

    return true;
  }

  // =========================================================
  // PAYMENT REJECTED / CANCELLED
  // =========================================================

  if (
    paymentMP.status === "rejected" ||
    paymentMP.status === "cancelled"
  ) {
    console.log(
      "=========================================="
    );

    console.log(
      "PAGO RECHAZADO / CANCELADO"
    );

    console.log(
      "CHECKOUT SESSION:",
      session.id
    );

    console.log(
      "ESTADO MP:",
      paymentMP.status
    );

    console.log(
      "=========================================="
    );

    await updateCheckoutSessionStatus(
      session.id,
      "FAILED",
      {
        paymentStatus: "FAILED",

        paymentMethod:
          session.paymentMethod ||
          "MERCADO_PAGO",

        paymentPreferenceId:
          session.paymentPreferenceId,

        paymentTransactionId:
          String(paymentMP.id),

        paymentReferenceId,

        paymentVerificationCode,

        paymentInstructionsUrl,
      }
    );

    console.log(
      "CHECKOUT SESSION MARCADA COMO FAILED."
    );

    return true;
  }

  // =========================================================
  // PAYMENT PENDING / IN_PROCESS
  // =========================================================

  if (
    paymentMP.status === "pending" ||
    paymentMP.status === "in_process"
  ) {
    console.log(
      "=========================================="
    );

    console.log(
      "PAGO TODAVÍA PENDIENTE"
    );

    console.log(
      "CHECKOUT SESSION:",
      session.id
    );

    console.log(
      "ESTADO MP:",
      paymentMP.status
    );

    console.log(
      "=========================================="
    );

    await updateCheckoutSessionStatus(
      session.id,
      "PAYMENT_PENDING",
      {
        paymentStatus: "PENDING",

        paymentMethod:
          session.paymentMethod ||
          "MERCADO_PAGO",

        paymentPreferenceId:
          session.paymentPreferenceId,

        paymentTransactionId:
          String(paymentMP.id),

        paymentReferenceId,

        paymentVerificationCode,

        paymentInstructionsUrl,
      }
    );

    console.log(
      "DATOS DEL TICKET GUARDADOS EN CHECKOUT SESSION."
    );

    console.log(
      "CHECKOUT SESSION CONTINÚA COMO PAYMENT_PENDING."
    );

    return true;
  }

  // =========================================================
  // OTROS ESTADOS
  // =========================================================

  console.log(
    `ESTADO DE MERCADO PAGO NO PROCESADO: ${paymentMP.status}`
  );

  return true;
}

