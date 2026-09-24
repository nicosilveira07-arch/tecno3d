import {
  createMercadoPagoPreference,
} from "../integrations/mercadopago/mercadopago.service.js";

import {
  getCheckoutSessionById,
  deleteCheckoutSession,
  deleteCheckoutSessionItems,
} from "../repositories/checkoutSession.repository.js";

export async function createOrderPaymentService(
  checkoutSessionId,
  userId
) {
  if (!checkoutSessionId) {
    throw new Error(
      "La sesión de checkout es obligatoria."
    );
  }

  if (!userId) {
    throw new Error(
      "El usuario es obligatorio."
    );
  }

  const session =
    await getCheckoutSessionById(
      checkoutSessionId,
      userId
    );

  if (!session) {
    throw new Error(
      "Sesión de checkout no encontrada."
    );
  }

  if (session.status !== "ACTIVE") {
    if (
      session.status ===
      "PAYMENT_PENDING"
    ) {
      throw new Error(
        "Esta sesión ya tiene un pago pendiente iniciado."
      );
    }

    if (
      session.status ===
      "COMPLETED"
    ) {
      throw new Error(
        "Esta sesión de checkout ya fue completada."
      );
    }

    throw new Error(
      "La sesión de checkout ya no está disponible."
    );
  }

  if (
    session.expiresAt <= new Date()
  ) {
    await deleteCheckoutSessionItems(
      session.id
    );

    await deleteCheckoutSession(
      session.id,
      userId
    );

    throw new Error(
      "La sesión de checkout ha vencido."
    );
  }

  const items = [
    {
      title:
        `Compra TECNO 3D #${session.id}`,
      quantity: 1,
      unit_price:
        Number(session.total),
      currency_id: "UYU",
    },
  ];

  const preference =
    await createMercadoPagoPreference({
      checkoutSessionId:
        session.id,
      items,
    });

  if (!preference?.id) {
    throw new Error(
      "Mercado Pago no devolvió un ID de preferencia válido."
    );
  }

  /*
   * IMPORTANTE:
   *
   * NO cambiamos la CheckoutSession a
   * PAYMENT_PENDING en este momento.
   *
   * Mientras Mercado Pago está abierto,
   * la sesión permanece ACTIVE.
   *
   * Solo el webhook de Mercado Pago puede
   * determinar qué ocurrió realmente:
   *
   * - approved -> crea Order real
   * - ticket / Abitab / Redpagos -> PAYMENT_PENDING
   * - rejected / cancelled -> no genera Order
   *
   * De esta manera, volver atrás desde Mercado Pago
   * no genera compras pendientes basura.
   */

  return {
    checkoutSession:
      session,
    preferenceId:
      preference.id,
    initPoint:
      preference.init_point,
    sandboxInitPoint:
      preference.sandbox_init_point,
  };
}