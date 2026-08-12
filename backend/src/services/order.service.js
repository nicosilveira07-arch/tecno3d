import {
  getOrdersByUser,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../repositories/order.repository.js";

import {
  getProductByIdForOrder,
} from "../repositories/product.repository.js";

import prisma from "../lib/prisma.js";



const createOrderService = async (data) => {
  const {
    items,
    userId,
    deliveryMethod = "SHIPPING",
    addressId,
  } = data;

  let total = 0;

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
    const product =
      await getProductByIdForOrder(
        item.productId
      );

    if (!product) {
      throw new Error(
        `Producto no encontrado: ${item.productId}`
      );
    }

    if (product.stock < item.quantity) {
      throw new Error(
        `Stock insuficiente para ${product.name}`
      );
    }

    total +=
      product.price * item.quantity;

    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      price: product.price,
    });
  }



  // CREAR PEDIDO

  const order =
    await prisma.order.create({
      data: {
        userId,
        total,
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
      },
    });

  return order;
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

    CONFIRMED: [
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



  // CONFIRMED → PROCESSING
  // SOLO SI EL PAGO ESTÁ CONFIRMADO

  if (
    currentStatus === "CONFIRMED" &&
    status === "PROCESSING"
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

    // CONVERTIMOS A STRING ANTES DE USAR trim()

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
  getMyOrdersService,
  getOrdersService,
  getOrderByIdService,
  updateOrderStatusService,
};
