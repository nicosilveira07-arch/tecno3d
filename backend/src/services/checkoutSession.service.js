import {
  createCheckoutSession,
  getCheckoutSessionById,
  getActiveCheckoutSessionByUser,
  updateCheckoutSession,
  updateCheckoutSessionStatus,
  deleteCheckoutSession,
  deleteCheckoutSessionItems,
  getPendingCheckoutSessionsByUser,
  getPendingCheckoutSessions,
} from "../repositories/checkoutSession.repository.js";

import {
  findById,
} from "../repositories/address.repository.js";

import {
  getProductByIdForOrder,
} from "../repositories/product.repository.js";

const deleteExpiredCheckoutSession =
  async (
    sessionId,
    userId
  ) => {
    await deleteCheckoutSessionItems(
      sessionId
    );

    await deleteCheckoutSession(
      sessionId,
      userId
    );
  };

// ======================================================
// PREPARAR ITEMS DEL CHECKOUT
// ======================================================
//
// Permite:
//
// - Producto normal sin variante
// - Producto con variantes SIN variante seleccionada
//   → se compra el producto principal/base
// - Producto con variante seleccionada
//   → se compra esa variante
//
// El variantName se obtiene del backend.
// ======================================================

const prepareCheckoutItems = async (
  items
) => {
  const preparedItems = [];

  for (
    const item of items
  ) {
    if (!item.productId) {
      throw new Error(
        `El producto "${item.productName || "seleccionado"}" no es válido.`
      );
    }

    const product =
      await getProductByIdForOrder(
        item.productId
      );

    if (!product) {
      throw new Error(
        `El producto "${item.productName || "seleccionado"}" ya no existe.`
      );
    }

    const quantity =
      Number(item.quantity);

    const price =
      Number(item.price);

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        `La cantidad de ${product.name} no es válida.`
      );
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw new Error(
        `El precio de ${product.name} no es válido.`
      );
    }

    // ==================================================
    // PRODUCTO CON VARIANTES
    // ==================================================
    //
    // Si viene variantId:
    //   → validar y guardar la variante.
    //
    // Si NO viene variantId:
    //   → permitir comprar el producto principal/base.
    // ==================================================

    if (product.hasVariants) {
      if (item.variantId) {
        const variant =
          product.variants.find(
            (currentVariant) =>
              currentVariant.id ===
              item.variantId
          );

        if (!variant) {
          throw new Error(
            `La variante seleccionada no pertenece al producto ${product.name}.`
          );
        }

        preparedItems.push({
          quantity,

          price,

          productName:
            product.name,

          productId:
            product.id,

          variantId:
            variant.id,

          variantName:
            variant.name,
        });

        continue;
      }

      // ================================================
      // PRODUCTO PRINCIPAL SIN VARIANTE
      // ================================================

      preparedItems.push({
        quantity,

        price,

        productName:
          product.name,

        productId:
          product.id,

        variantId:
          null,

        variantName:
          null,
      });

      continue;
    }

    // ==================================================
    // PRODUCTO NORMAL SIN VARIANTES
    // ==================================================

    if (item.variantId) {
      throw new Error(
        `El producto ${product.name} no utiliza variantes.`
      );
    }

    preparedItems.push({
      quantity,

      price,

      productName:
        product.name,

      productId:
        product.id,

      variantId:
        null,

      variantName:
        null,
    });
  }

  return preparedItems;
};

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

  // ======================================================
  // VALIDAR DIRECCIÓN DE ENVÍO
  // ======================================================

  if (
    deliveryMethod === "SHIPPING" &&
    !addressId
  ) {
    throw new Error(
      "Debes seleccionar una dirección de envío."
    );
  }

  if (
    deliveryMethod === "SHIPPING"
  ) {
    const address =
      await findById(
        addressId
      );

    if (!address) {
      throw new Error(
        "La dirección de envío no existe."
      );
    }

    if (
      address.userId !==
      userId
    ) {
      throw new Error(
        "La dirección de envío no pertenece al usuario."
      );
    }

    if (
      !address.phone ||
      !address.phone.trim()
    ) {
      throw new Error(
        "La dirección de envío debe tener un teléfono de contacto."
      );
    }

    if (
      !address.city ||
      !address.city.trim()
    ) {
      throw new Error(
        "La dirección de envío debe tener una ciudad."
      );
    }

    if (
      !address.state ||
      !address.state.trim()
    ) {
      throw new Error(
        "La dirección de envío debe tener un departamento."
      );
    }
  }

  if (
    deliveryMethod === "PICKUP" &&
    addressId
  ) {
    throw new Error(
      "El retiro en local no debe tener una dirección."
    );
  }

  // ======================================================
  // VALIDAR VENCIMIENTO
  // ======================================================

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

  // ======================================================
  // PREPARAR ITEMS
  // ======================================================

  const preparedItems =
    await prepareCheckoutItems(
      items
    );

  // ======================================================
  // BUSCAR SESIÓN ACTIVA EXISTENTE
  // ======================================================

  const activeSession =
    await getActiveCheckoutSessionByUser(
      userId
    );

  // ======================================================
  // REUTILIZAR SESIÓN ACTIVA
  // ======================================================
  //
  // IMPORTANTE:
  // Se reemplazan sus items para evitar que una variante
  // anterior quede almacenada en la sesión.
  // ======================================================

  if (activeSession) {
    await deleteCheckoutSessionItems(
      activeSession.id
    );

    return await updateCheckoutSession(
      activeSession.id,
      {
        total:
          Number(total),

        discount:
          Number(discount),

        couponId,

        deliveryMethod,

        addressId:
          deliveryMethod === "SHIPPING"
            ? addressId
            : null,

        expiresAt:
          expirationDate,

        items: {
          create:
            preparedItems.map(
              (item) => ({
                quantity:
                  item.quantity,

                price:
                  item.price,

                productName:
                  item.productName,

                productId:
                  item.productId,

                variantId:
                  item.variantId,

                variantName:
                  item.variantName,
              })
            ),
        },
      }
    );
  }

  // ======================================================
  // CREAR NUEVA CHECKOUT SESSION
  // ======================================================

  return await createCheckoutSession({
    userId,

    total:
      Number(total),

    discount:
      Number(discount),

    couponId,

    deliveryMethod,

    addressId:
      deliveryMethod === "SHIPPING"
        ? addressId
        : null,

    status:
      "ACTIVE",

    expiresAt:
      expirationDate,

    items: {
      create:
        preparedItems.map(
          (item) => ({
            quantity:
              item.quantity,

            price:
              item.price,

            productName:
              item.productName,

            productId:
              item.productId,

            variantId:
              item.variantId,

            variantName:
              item.variantName,
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
    await deleteExpiredCheckoutSession(
      session.id,
      userId
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

  // ====================================================
  // SESIÓN VENCIDA
  // ====================================================

  if (
    session.expiresAt <= new Date()
  ) {
    await deleteExpiredCheckoutSession(
      session.id,
      userId
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
      session.status ===
      "COMPLETED"
    ) {
      throw new Error(
        "La sesión de checkout ya fue completada."
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

