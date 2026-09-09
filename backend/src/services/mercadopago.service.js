import {
createMercadoPagoPreference,
} from "../integrations/mercadopago/mercadopago.service.js";

import {
getCheckoutSessionById,
updateCheckoutSessionStatus,
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

// La sesión debe seguir activa para
// poder iniciar el pago.

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

if (
  session.status ===
  "EXPIRED"
) {
  throw new Error(
    "La sesión de checkout ha vencido."
  );
}

throw new Error(
  "La sesión de checkout ya no está disponible."
);


}

// Verificar vencimiento antes de iniciar
// cualquier operación de pago.

if (
session.expiresAt <= new Date()
) {
await updateCheckoutSessionStatus(
session.id,
"EXPIRED"
);


throw new Error(
  "La sesión de checkout ha vencido."
);


}

// Preparar los productos de la sesión
// para Mercado Pago.

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

// Crear la preferencia usando el ID
// de CheckoutSession como referencia externa.

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

// Marcar la sesión como pago pendiente
// solamente después de que Mercado Pago
// haya creado correctamente la preferencia.

const updatedSession =
await updateCheckoutSessionStatus(
session.id,
"PAYMENT_PENDING",
{
paymentStatus: "PENDING",


    paymentMethod:
      "MERCADO_PAGO",

    paymentPreferenceId:
      preference.id,
  }
);


return {
checkoutSession:
updatedSession,


preferenceId:
  preference.id,

initPoint:
  preference.init_point,

sandboxInitPoint:
  preference.sandbox_init_point,

};
}
