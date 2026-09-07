import {
  getOrdersByUser,
  getAllOrders,
  getOrderById,
  getPendingOrderByUser,
  getPendingOrderById,
  cancelPendingOrder,
  updateOrderStatus,
} from "../repositories/order.repository.js";

import {
  getProductByIdForOrder,
} from "../repositories/product.repository.js";

import prisma from "../lib/prisma.js";

import {
  findCouponByCodeRepository,
  incrementCouponUsageRepository,
} from "../repositories/coupon.repository.js";

const createOrderService = async (data) => {
  const {
    items,
    userId,
    deliveryMethod = "SHIPPING",
    addressId,
    couponCode,
  } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(
      "El pedido debe contener al menos un producto."
    );
  }

  let subtotal = 0;

  const orderItems = [];

  // VALIDAR MÉTODO DE ENTREGA

  if (
    !["SHIPPING", "PICKUP"].includes(
      deliveryMethod
    )
  ) {
    throw new Error(
      "Método de entrega inválido."
    );
  }

  // SHIPPING → dirección obligatoria

  if (deliveryMethod === "SHIPPING") {
    if (!addressId) {
      throw new Error(
        "Debes seleccionar una dirección de envío."
      );
    }

    const address =
      await prisma.address.findUnique({
        where: {
          id: addressId,
        },
      });

    if (!address) {
      throw new Error(
        "La dirección seleccionada no existe."
      );
    }

    if (address.userId !== userId) {
      throw new Error(
        "No tienes permiso para utilizar esta dirección."
      );
    }
  }

  // PICKUP → no utiliza dirección

  if (deliveryMethod === "PICKUP") {
    if (addressId) {
      throw new Error(
        "El retiro en local no debe tener una dirección de envío."
      );
    }
  }

  // VALIDAR PRODUCTOS Y STOCK

  for (const item of items) {
    const quantity = Number(item.quantity);

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        "La cantidad de cada producto debe ser un número entero mayor a 0."
      );
    }

    const product =
      await getProductByIdForOrder(
        item.productId
      );

    if (!product) {
      throw new Error(
        `Producto no encontrado: ${item.productId}`
      );
    }

    if (product.stock < quantity) {
      throw new Error(
        `Stock insuficiente para ${product.name}`
      );
    }

    // DETERMINAR PRECIO REAL DEL PRODUCTO

    const originalPrice =
      Number(product.price);

    const offerPrice =
      product.offerActive &&
      product.offerPrice !== null &&
      product.offerPrice !== undefined
        ? Number(product.offerPrice)
        : null;

    const effectivePrice =
      offerPrice !== null &&
      offerPrice > 0 &&
      offerPrice < originalPrice
        ? offerPrice
        : originalPrice;

    subtotal +=
      effectivePrice * quantity;

    orderItems.push({
      productId: product.id,
      productName: product.name,
      quantity,
      price: effectivePrice,
    });
  }

  // VALIDAR CUPÓN

  let coupon = null;
  let discount = 0;

  if (
    couponCode &&
    String(couponCode).trim()
  ) {
    const normalizedCode = String(
      couponCode
    )
      .trim()
      .toUpperCase();

    coupon =
      await findCouponByCodeRepository(
        normalizedCode
      );

    if (!coupon) {
      throw new Error(
        "El cupón no existe."
      );
    }

    if (!coupon.active) {
      throw new Error(
        "El cupón está inactivo."
      );
    }

    if (
      coupon.expiresAt &&
      coupon.expiresAt <= new Date()
    ) {
      throw new Error(
        "El cupón está vencido."
      );
    }

    if (
      coupon.maxUses !== null &&
      coupon.usedCount >= coupon.maxUses
    ) {
      throw new Error(
        "El cupón alcanzó el máximo de usos."
      );
    }

    if (coupon.type === "PERCENTAGE") {
      discount =
        subtotal * (coupon.value / 100);
    }

    if (coupon.type === "FIXED") {
      discount = coupon.value;
    }

    // Nunca permitir descuento mayor al subtotal

    discount = Math.min(
      discount,
      subtotal
    );
  }

  // TOTAL FINAL

  const total = Math.max(
    subtotal - discount,
    0
  );

  // BUSCAR PEDIDO PENDIENTE DEL USUARIO

  const pendingOrder =
    await prisma.order.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
      include: {
        items: true,
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  // SI EXISTE UN PEDIDO PENDIENTE,
  // REUTILIZAR EL MISMO PEDIDO

  if (pendingOrder) {
    // Un pedido con pago confirmado no puede reutilizarse.

    if (
      pendingOrder.payment &&
      pendingOrder.payment.status === "PAID"
    ) {
      throw new Error(
        "Este pedido ya tiene el pago confirmado."
      );
    }

    const oldCouponId =
      pendingOrder.couponId;

    const newCouponId =
      coupon?.id || null;

    const couponChanged =
      oldCouponId !== newCouponId;

    const order =
      await prisma.$transaction(
        async (tx) => {
          // Si el pedido tenía un cupón anterior
          // y ahora se cambia por otro, liberar
          // el uso anterior.

          if (
            couponChanged &&
            oldCouponId
          ) {
            await tx.coupon.update({
              where: {
                id: oldCouponId,
              },
              data: {
                usedCount: {
                  decrement: 1,
                },
              },
            });
          }

          // Si se coloca un cupón nuevo,
          // registrar su uso solamente una vez.

          if (
            couponChanged &&
            newCouponId
          ) {
            await tx.coupon.update({
              where: {
                id: newCouponId,
              },
              data: {
                usedCount: {
                  increment: 1,
                },
              },
            });
          }

          // Eliminar los productos anteriores
          // del mismo pedido.

          await tx.orderItem.deleteMany({
            where: {
              orderId: pendingOrder.id,
            },
          });

          // Actualizar el mismo pedido.
          // El ID NO cambia.

          return await tx.order.update({
            where: {
              id: pendingOrder.id,
            },
            data: {
              total,
              discount,
              couponId: newCouponId,
              deliveryMethod,
              addressId:
                deliveryMethod === "SHIPPING"
                  ? addressId
                  : null,
              items: {
                create: orderItems,
              },
            },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
              address: true,
              coupon: true,
              payment: true,
            },
          });
        }
      );

    return order;
  }

  // NO EXISTE PENDING → CREAR UNO NUEVO

  const order =
    await prisma.order.create({
      data: {
        userId,

        total,

        discount,

        couponId: coupon
          ? coupon.id
          : null,

        deliveryMethod,

        addressId:
          deliveryMethod === "SHIPPING"
            ? addressId
            : null,

        items: {
          create: orderItems,
        },
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },

        address: true,

        coupon: true,

        payment: true,
      },
    });

  // INCREMENTAR USO DEL CUPÓN
  // SOLAMENTE CUANDO SE CREA EL PEDIDO.

  if (coupon) {
    await incrementCouponUsageRepository(
      coupon.id
    );
  }

  return order;
};

// ======================================================
// CONTINUAR COMPRA
// ======================================================

const getPendingOrderService = async (
  orderId,
  userId
) => {
  const pendingOrder =
    await getPendingOrderById(
      orderId,
      userId
    );

  if (!pendingOrder) {
    throw new Error(
      "El pedido pendiente no existe o no tienes permiso para continuarlo."
    );
  }

  // SEGURIDAD:
  // El repositorio filtra por ID, usuario y PENDING.
  // Esta validación adicional evita que este servicio
  // pueda devolver accidentalmente otro pedido.

  if (
    pendingOrder.id !== orderId ||
    pendingOrder.userId !== userId ||
    pendingOrder.status !== "PENDING"
  ) {
    throw new Error(
      "No tienes permiso para continuar este pedido."
    );
  }

  // Un pedido PENDING con pago PAID no puede continuar.

  if (
    pendingOrder.payment &&
    pendingOrder.payment.status === "PAID"
  ) {
    throw new Error(
      "Este pedido ya tiene el pago confirmado."
    );
  }

  // Si alguno de los productos originales
  // fue eliminado, no podemos reconstruir
  // correctamente el carrito.

  const unavailableItems =
    pendingOrder.items.filter(
      (item) => !item.product
    );

  if (unavailableItems.length > 0) {
    throw new Error(
      "Uno o más productos de este pedido ya no están disponibles."
    );
  }

  if (
    !pendingOrder.items ||
    pendingOrder.items.length === 0
  ) {
    throw new Error(
      "El pedido pendiente no contiene productos."
    );
  }

  return pendingOrder;
};

// ======================================================
// CANCELAR COMPRA PENDIENTE
// ======================================================

const cancelPendingOrderService = async (
  orderId,
  userId
) => {
  const pendingOrder =
    await getPendingOrderById(
      orderId,
      userId
    );

  if (!pendingOrder) {
    throw new Error(
      "El pedido pendiente no existe o no tienes permiso para cancelarlo."
    );
  }

  // SEGURIDAD:
  // Solo se permite cancelar un pedido
  // perteneciente al usuario y con estado PENDING.

  if (
    pendingOrder.id !== orderId ||
    pendingOrder.userId !== userId ||
    pendingOrder.status !== "PENDING"
  ) {
    throw new Error(
      "No tienes permiso para cancelar este pedido."
    );
  }

  // Un pedido que ya fue pagado no puede cancelarse
  // mediante esta función.

  if (
    pendingOrder.payment &&
    pendingOrder.payment.status === "PAID"
  ) {
    throw new Error(
      "Este pedido ya tiene el pago confirmado y no puede cancelarse."
    );
  }

  const cancelledOrder =
    await cancelPendingOrder(
      orderId,
      userId
    );

  if (!cancelledOrder) {
    throw new Error(
      "El pedido ya no está pendiente o no puede cancelarse."
    );
  }

  return cancelledOrder;
};

const getMyOrdersService = async (
  userId
) => {
  return await getOrdersByUser(userId);
};

const getOrdersService = async () => {
  return await getAllOrders();
};

const getOrderByIdService = async (
  id,
  user
) => {
  const order =
    await getOrderById(id);

  if (!order) {
    throw new Error(
      "Pedido no encontrado."
    );
  }

  if (
    user.role === "CUSTOMER" &&
    order.userId !== user.id
  ) {
    throw new Error(
      "No tienes permisos para ver este pedido."
    );
  }

  return order;
};

const updateOrderStatusService = async (
  id,
  status,
  shippingCompany,
  trackingNumber
) => {
  const order =
    await getOrderById(id);

  if (!order) {
    throw new Error(
      "Pedido no encontrado."
    );
  }

  const allowedTransitions = {
    PENDING: [
      "CONFIRMED",
      "CANCELLED",
    ],

    CONFIRMED:
      order.deliveryMethod === "PICKUP"
        ? [
            "DELIVERED",
            "CANCELLED",
          ]
        : [
            "PROCESSING",
            "CANCELLED",
          ],

    PROCESSING: [
      "SHIPPED",
      "CANCELLED",
    ],

    SHIPPED: [
      "DELIVERED",
    ],

    DELIVERED: [],

    CANCELLED: [],
  };

  const currentStatus =
    order.status;

  // VALIDAR TRANSICIÓN

  if (
    !allowedTransitions[
      currentStatus
    ]?.includes(status)
  ) {
    throw new Error(
      `No se puede cambiar el estado de ${currentStatus} a ${status}.`
    );
  }

  // PICKUP → DELIVERED
  // EL PAGO DEBE ESTAR CONFIRMADO

  if (
    order.deliveryMethod === "PICKUP" &&
    currentStatus === "CONFIRMED" &&
    status === "DELIVERED"
  ) {
    const payment =
      await prisma.payment.findUnique({
        where: {
          orderId: id,
        },
      });

    if (!payment) {
      throw new Error(
        "El pedido no tiene un pago registrado."
      );
    }

    if (payment.status !== "PAID") {
      throw new Error(
        "El pedido no puede entregarse porque el pago no está confirmado."
      );
    }
  }

  // CONFIRMED → PROCESSING
  // SOLO PARA ENVÍOS
  // EL PAGO DEBE ESTAR CONFIRMADO

  if (
    currentStatus === "CONFIRMED" &&
    status === "PROCESSING"
  ) {
    if (
      order.deliveryMethod !== "SHIPPING"
    ) {
      throw new Error(
        "Este pedido es para retiro en local y no requiere preparación para envío."
      );
    }

    const payment =
      await prisma.payment.findUnique({
        where: {
          orderId: id,
        },
      });

    if (!payment) {
      throw new Error(
        "El pedido no tiene un pago registrado."
      );
    }

    if (payment.status !== "PAID") {
      throw new Error(
        "El pedido no puede prepararse porque el pago no está confirmado."
      );
    }
  }

  // PROCESSING → SHIPPED
  // REQUIERE DATOS DE ENVÍO

  if (
    currentStatus === "PROCESSING" &&
    status === "SHIPPED"
  ) {
    if (
      order.deliveryMethod !== "SHIPPING"
    ) {
      throw new Error(
        "Este pedido no requiere envío."
      );
    }

    const company =
      shippingCompany !== null &&
      shippingCompany !== undefined
        ? String(shippingCompany).trim()
        : "";

    const tracking =
      trackingNumber !== null &&
      trackingNumber !== undefined
        ? String(trackingNumber).trim()
        : "";

    if (!company) {
      throw new Error(
        "Debes indicar la empresa de envío."
      );
    }

    if (!tracking) {
      throw new Error(
        "Debes indicar el número de rastreo."
      );
    }

    shippingCompany = company;
    trackingNumber = tracking;
  }

  // DATOS DE ENVÍO

  const shippingData =
    currentStatus === "PROCESSING" &&
    status === "SHIPPED"
      ? {
          shippingCompany:
            String(shippingCompany).trim(),

          trackingNumber:
            String(trackingNumber).trim(),
        }
      : {};

  return await updateOrderStatus(
    id,
    status,
    shippingData
  );
};

export {
  createOrderService,
  getPendingOrderService,
  cancelPendingOrderService,
  getMyOrdersService,
  getOrdersService,
  getOrderByIdService,
  updateOrderStatusService,
};

