import {
createCheckoutSession,
getCheckoutSessionById,
getActiveCheckoutSessionByUser,
updateCheckoutSession,
updateCheckoutSessionStatus,
deleteCheckoutSession,
getPendingCheckoutSessionsByUser,
getPendingCheckoutSessions,
} from "../repositories/checkoutSession.repository.js";

// ======================================================
// CREAR CHECKOUT SESSION
// ======================================================

const createCheckoutSessionService = async (
data
) => {
const {
userId,
total,
discount = 0,
couponId = null,
deliveryMethod = "SHIPPING",
addressId = null,
items,
expiresAt,
} = data;

if (!userId) {
throw new Error(
"El usuario es obligatorio."
);
}

if (
!Array.isArray(items) ||
items.length === 0
) {
throw new Error(
"La sesión de checkout debe contener al menos un producto."
);
}

if (
!Number.isFinite(Number(total)) ||
Number(total) < 0
) {
throw new Error(
"El total del checkout no es válido."
);
}

if (
!["SHIPPING", "PICKUP"].includes(
deliveryMethod
)
) {
throw new Error(
"Método de entrega inválido."
);
}

if (
deliveryMethod === "SHIPPING" &&
!addressId
) {
throw new Error(
"Debes seleccionar una dirección de envío."
);
}

if (
deliveryMethod === "PICKUP" &&
addressId
) {
throw new Error(
"El retiro en local no debe tener una dirección."
);
}

if (!expiresAt) {
throw new Error(
"La sesión de checkout debe tener una fecha de vencimiento."
);
}

const expirationDate =
new Date(expiresAt);

if (
Number.isNaN(
expirationDate.getTime()
)
) {
throw new Error(
"La fecha de vencimiento no es válida."
);
}

if (
expirationDate <= new Date()
) {
throw new Error(
"La sesión de checkout ya está vencida."
);
}

const activeSession =
await getActiveCheckoutSessionByUser(
userId
);

// Si ya existe una sesión activa, reutilizarla
// en lugar de crear otra sesión temporal.

if (activeSession) {
return await updateCheckoutSession(
activeSession.id,
{
total: Number(total),
discount: Number(discount),
couponId,
deliveryMethod,
addressId:
deliveryMethod === "SHIPPING"
? addressId
: null,
expiresAt:
expirationDate,
}
);
}

return await createCheckoutSession({
userId,
total: Number(total),
discount: Number(discount),
couponId,
deliveryMethod,
addressId:
deliveryMethod === "SHIPPING"
? addressId
: null,
status: "ACTIVE",
expiresAt: expirationDate,
items: {
create: items.map(
(item) => ({
quantity:
Number(item.quantity),
price:
Number(item.price),
productName:
item.productName,
productId:
item.productId || null,
})
),
},
});
};

// ======================================================
// OBTENER CHECKOUT SESSION
// ======================================================

const getCheckoutSessionService = async (
id,
userId
) => {
const session =
await getCheckoutSessionById(
id,
userId
);

if (!session) {
throw new Error(
"Sesión de checkout no encontrada."
);
}

if (
session.expiresAt <= new Date() &&
(
session.status === "ACTIVE" ||
session.status === "PAYMENT_PENDING"
)
) {
await updateCheckoutSessionStatus(
session.id,
"EXPIRED"
);


throw new Error(
  "La sesión de checkout ha vencido."
);


}

return session;
};

// ======================================================
// ACTUALIZAR CHECKOUT SESSION
// ======================================================

const updateCheckoutSessionService = async (
id,
userId,
data
) => {
const session =
await getCheckoutSessionById(
id,
userId
);

if (!session) {
throw new Error(
"Sesión de checkout no encontrada."
);
}

if (
session.status ===
"PAYMENT_PENDING"
) {
throw new Error(
"La sesión tiene un pago pendiente y no puede modificarse."
);
}

if (
session.status !== "ACTIVE"
) {
throw new Error(
"La sesión de checkout ya no puede modificarse."
);
}

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

return await updateCheckoutSession(
session.id,
data
);
};

// ======================================================
// MARCAR PAGO PENDIENTE
// ======================================================

const markCheckoutSessionPaymentPendingService =
async (
id,
userId,
paymentData
) => {
const session =
await getCheckoutSessionById(
id,
userId
);


if (!session) {
  throw new Error(
    "Sesión de checkout no encontrada."
  );
}

if (
  session.status === "COMPLETED"
) {
  throw new Error(
    "La sesión de checkout ya fue completada."
  );
}

if (
  session.status === "EXPIRED"
) {
  throw new Error(
    "La sesión de checkout ha vencido."
  );
}

return await updateCheckoutSessionStatus(
  id,
  "PAYMENT_PENDING",
  {
    paymentStatus:
      paymentData?.paymentStatus ||
      "PENDING",

    paymentMethod:
      paymentData?.paymentMethod ||
      null,

    paymentPreferenceId:
      paymentData?.paymentPreferenceId ||
      null,

    paymentTransactionId:
      paymentData?.paymentTransactionId ||
      null,
  }
);


};

// ======================================================
// COMPLETAR CHECKOUT
// ======================================================

const completeCheckoutSessionService =
async (
id,
paymentData = {}
) => {
const session =
await getCheckoutSessionById(
id,
null
);


if (!session) {
  throw new Error(
    "Sesión de checkout no encontrada."
  );
}

if (
  session.status ===
  "COMPLETED"
) {
  return session;
}

if (
  session.status ===
  "EXPIRED"
) {
  throw new Error(
    "La sesión de checkout ha vencido."
  );
}

return await updateCheckoutSessionStatus(
  id,
  "COMPLETED",
  {
    paymentStatus:
      paymentData.paymentStatus ||
      "PAID",

    paymentMethod:
      paymentData.paymentMethod ||
      session.paymentMethod,

    paymentPreferenceId:
      paymentData.paymentPreferenceId ||
      session.paymentPreferenceId,

    paymentTransactionId:
      paymentData.paymentTransactionId ||
      session.paymentTransactionId,
  }
);


};

// ======================================================
// MARCAR CHECKOUT COMO FALLIDO
// ======================================================

const failCheckoutSessionService =
async (
id,
paymentData = {}
) => {
const session =
await getCheckoutSessionById(
id,
null
);


if (!session) {
  throw new Error(
    "Sesión de checkout no encontrada."
  );
}

if (
  session.status ===
  "COMPLETED"
) {
  throw new Error(
    "La sesión ya fue completada."
  );
}

return await updateCheckoutSessionStatus(
  id,
  "FAILED",
  {
    paymentStatus:
      paymentData.paymentStatus ||
      "FAILED",

    paymentMethod:
      paymentData.paymentMethod ||
      session.paymentMethod,

    paymentPreferenceId:
      paymentData.paymentPreferenceId ||
      session.paymentPreferenceId,

    paymentTransactionId:
      paymentData.paymentTransactionId ||
      session.paymentTransactionId,
  }
);


};

// ======================================================
// CHECKOUTS EN TRÁMITE DEL USUARIO
// ======================================================

const getPendingCheckoutSessionsByUserService =
async (
userId
) => {
const sessions =
await getPendingCheckoutSessionsByUser(
userId
);

return sessions;
};

// ======================================================
// CHECKOUTS EN TRÁMITE PARA ADMIN
// ======================================================

const getPendingCheckoutSessionsService =
async () => {
const sessions =
await getPendingCheckoutSessions();

return sessions;
};

// ======================================================
// ELIMINAR CHECKOUT SESSION
// ======================================================

const deleteCheckoutSessionService =
async (
id,
userId
) => {
const session =
await getCheckoutSessionById(
id,
userId
);


if (!session) {
  throw new Error(
    "Sesión de checkout no encontrada."
  );
}

if (
  session.status ===
  "PAYMENT_PENDING"
) {
  throw new Error(
    "La sesión tiene un pago pendiente y no puede eliminarse."
  );
}

if (
  session.status ===
  "COMPLETED"
) {
  throw new Error(
    "La sesión ya fue completada y no puede eliminarse."
  );
}

await deleteCheckoutSession(
  id,
  userId
);

return {
  id,
  deleted: true,
};


};

export {
createCheckoutSessionService,
getCheckoutSessionService,
updateCheckoutSessionService,
markCheckoutSessionPaymentPendingService,
completeCheckoutSessionService,
failCheckoutSessionService,
deleteCheckoutSessionService,
getPendingCheckoutSessionsByUserService,
getPendingCheckoutSessionsService,
};
