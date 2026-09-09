import api from "./api";

// ======================================================
// CREAR CHECKOUT SESSION
// ======================================================

export async function createCheckoutSession(
  data
) {
  const response = await api.post(
    "/checkout-sessions",
    data
  );

  return response.data;
}

// ======================================================
// OBTENER CHECKOUT SESSION
// ======================================================

export async function getCheckoutSession(
  sessionId
) {
  const response = await api.get(
    `/checkout-sessions/${sessionId}`
  );

  return response.data;
}

// ======================================================
// OBTENER CHECKOUTS EN TRÁMITE DEL USUARIO
// ======================================================

export async function getPendingCheckoutSessionsByUser() {
  const response = await api.get(
    "/checkout-sessions/my-pending"
  );

  return response.data;
}

// ======================================================
// OBTENER CHECKOUTS EN TRÁMITE PARA ADMIN
// ======================================================

export async function getPendingCheckoutSessions() {
  const response = await api.get(
    "/checkout-sessions/admin/pending"
  );

  return response.data;
}

// ======================================================
// ACTUALIZAR CHECKOUT SESSION
// ======================================================

export async function updateCheckoutSession(
  sessionId,
  data
) {
  const response = await api.patch(
    `/checkout-sessions/${sessionId}`,
    data
  );

  return response.data;
}

// ======================================================
// MARCAR CHECKOUT SESSION COMO PAGO PENDIENTE
// ======================================================

export async function markCheckoutSessionPaymentPending(
  sessionId,
  data
) {
  const response = await api.patch(
    `/checkout-sessions/${sessionId}/payment-pending`,
    data
  );

  return response.data;
}

// ======================================================
// ELIMINAR CHECKOUT SESSION
// ======================================================

export async function deleteCheckoutSession(
  sessionId
) {
  const response = await api.delete(
    `/checkout-sessions/${sessionId}`
  );

  return response.data;
}