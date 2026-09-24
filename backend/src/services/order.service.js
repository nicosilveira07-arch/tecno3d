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

import { sendEmail } from "./email.service.js";

const FRONTEND_URL = "https://www.tecno3d.net";
const LOGO_URL = `${FRONTEND_URL}/logo.png`;

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

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

  // ACTUALIZAR EL PEDIDO PRIMERO

  const updatedOrder =
    await updateOrderStatus(
      id,
      status,
      shippingData
    );

  // ======================================================
  // NOTIFICACIÓN POR EMAIL
  // PROCESSING → SHIPPED
  // ======================================================

  if (
    currentStatus === "PROCESSING" &&
    status === "SHIPPED"
  ) {
    try {
      const customerEmail =
        updatedOrder.user?.email;

      if (!customerEmail) {
        console.warn(
          `⚠️ Pedido ${updatedOrder.id}: el cliente no tiene email.`
        );
      } else {
        const customerName =
          updatedOrder.user?.firstName ||
          "cliente";

        const orderNumber =
          updatedOrder.id;

        const company =
          updatedOrder.shippingCompany ||
          shippingCompany;

        const tracking =
          updatedOrder.trackingNumber ||
          trackingNumber;

        const ordersUrl =
          `${FRONTEND_URL}/orders`;

        const safeCustomerName =
          escapeHtml(customerName);

        const safeOrderNumber =
          escapeHtml(orderNumber);

        const safeCompany =
          escapeHtml(company);

        const safeTracking =
          escapeHtml(tracking);

        await sendEmail({
          to: customerEmail,

          subject:
            `Tu pedido #${orderNumber} ya fue enviado - TECNO 3D`,

          html: `
            <!DOCTYPE html>
            <html lang="es">
              <head>
                <meta charset="UTF-8">
                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1.0"
                >
                <title>Pedido enviado - TECNO 3D</title>
              </head>

              <body
                style="
                  margin: 0;
                  padding: 0;
                  background-color: #f1f5f9;
                  font-family: Arial, Helvetica, sans-serif;
                  color: #111827;
                "
              >
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    width: 100%;
                    background-color: #f1f5f9;
                    margin: 0;
                    padding: 0;
                  "
                >
                  <tr>
                    <td
                      align="center"
                      style="
                        padding: 32px 16px;
                      "
                    >
                      <table
                        role="presentation"
                        width="600"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                          width: 100%;
                          max-width: 600px;
                          background-color: #ffffff;
                          border-radius: 16px;
                          overflow: hidden;
                        "
                      >

                        <!-- HEADER -->
                        <tr>
                          <td
                            align="center"
                            style="
                              background-color: #18181b;
                              padding: 28px 24px;
                            "
                          >
                            <img
                              src="${LOGO_URL}"
                              alt="TECNO 3D"
                              width="170"
                              style="
                                display: block;
                                width: 170px;
                                max-width: 100%;
                                height: auto;
                                margin: 0 auto 18px;
                              "
                            >

                            <p
                              style="
                                margin: 0;
                                color: #ffffff;
                                font-size: 18px;
                                font-weight: bold;
                              "
                            >
                              Tu pedido está en camino
                            </p>

                            <p
                              style="
                                margin: 8px 0 0;
                                color: #a1a1aa;
                                font-size: 13px;
                              "
                            >
                              TECNO 3D
                            </p>
                          </td>
                        </tr>

                        <!-- CONTENIDO -->
                        <tr>
                          <td
                            style="
                              padding: 36px 32px;
                            "
                          >

                            <h1
                              style="
                                margin: 0 0 16px;
                                color: #111827;
                                font-size: 24px;
                                line-height: 1.3;
                              "
                            >
                              ¡Hola ${safeCustomerName}! 👋
                            </h1>

                            <p
                              style="
                                margin: 0 0 24px;
                                color: #4b5563;
                                font-size: 16px;
                                line-height: 1.7;
                              "
                            >
                              Tu pedido
                              <strong style="color: #111827;">
                                #${safeOrderNumber}
                              </strong>
                              ya fue despachado y se encuentra
                              en camino.
                            </p>

                            <!-- ESTADO -->
                            <table
                              role="presentation"
                              width="100%"
                              cellpadding="0"
                              cellspacing="0"
                              border="0"
                              style="
                                width: 100%;
                                background-color: #f8fafc;
                                border: 1px solid #e2e8f0;
                                border-radius: 12px;
                              "
                            >
                              <tr>
                                <td
                                  style="
                                    padding: 24px;
                                  "
                                >

                                  <p
                                    style="
                                      margin: 0 0 8px;
                                      color: #64748b;
                                      font-size: 12px;
                                      font-weight: bold;
                                      letter-spacing: 1px;
                                    "
                                  >
                                    ESTADO DEL PEDIDO
                                  </p>

                                  <p
                                    style="
                                      margin: 0 0 22px;
                                      color: #111827;
                                      font-size: 20px;
                                      font-weight: bold;
                                    "
                                  >
                                    🚚 Enviado
                                  </p>

                                  <!-- EMPRESA -->
                                  <table
                                    role="presentation"
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                  >
                                    <tr>
                                      <td
                                        width="48"
                                        valign="top"
                                        style="
                                          padding-right: 12px;
                                          font-size: 24px;
                                        "
                                      >
                                        🚛
                                      </td>

                                      <td
                                        valign="top"
                                      >
                                        <p
                                          style="
                                            margin: 0 0 4px;
                                            color: #64748b;
                                            font-size: 12px;
                                          "
                                        >
                                          EMPRESA DE ENVÍO
                                        </p>

                                        <p
                                          style="
                                            margin: 0;
                                            color: #111827;
                                            font-size: 16px;
                                            font-weight: bold;
                                          "
                                        >
                                          ${safeCompany}
                                        </p>
                                      </td>
                                    </tr>
                                  </table>

                                  <div
                                    style="
                                      height: 1px;
                                      background-color: #e2e8f0;
                                      margin: 20px 0;
                                    "
                                  ></div>

                                  <!-- TRACKING -->
                                  <table
                                    role="presentation"
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                  >
                                    <tr>
                                      <td
                                        width="48"
                                        valign="top"
                                        style="
                                          padding-right: 12px;
                                          font-size: 24px;
                                        "
                                      >
                                        🔎
                                      </td>

                                      <td
                                        valign="top"
                                      >
                                        <p
                                          style="
                                            margin: 0 0 4px;
                                            color: #64748b;
                                            font-size: 12px;
                                          "
                                        >
                                          NÚMERO DE SEGUIMIENTO
                                        </p>

                                        <p
                                          style="
                                            margin: 0;
                                            color: #111827;
                                            font-size: 16px;
                                            font-weight: bold;
                                            word-break: break-all;
                                          "
                                        >
                                          ${safeTracking}
                                        </p>
                                      </td>
                                    </tr>
                                  </table>

                                </td>
                              </tr>
                            </table>

                            <!-- MENSAJE -->
                            <p
                              style="
                                margin: 28px 0 0;
                                color: #4b5563;
                                font-size: 15px;
                                line-height: 1.7;
                              "
                            >
                              Podés consultar el estado de tu pedido
                              y revisar todos los detalles de tu compra
                              desde tu cuenta de TECNO 3D.
                            </p>

                            <!-- BOTÓN -->
                            <table
                              role="presentation"
                              width="100%"
                              cellpadding="0"
                              cellspacing="0"
                              border="0"
                              style="
                                margin-top: 28px;
                              "
                            >
                              <tr>
                                <td align="center">

                                  <a
                                    href="${ordersUrl}"
                                    style="
                                      display: inline-block;
                                      padding: 15px 28px;
                                      background-color: #18181b;
                                      color: #ffffff;
                                      text-decoration: none;
                                      border-radius: 8px;
                                      font-size: 14px;
                                      font-weight: bold;
                                    "
                                  >
                                    VER MIS COMPRAS
                                  </a>

                                </td>
                              </tr>
                            </table>

                            <!-- AYUDA -->
                            <p
                              style="
                                margin: 28px 0 0;
                                color: #64748b;
                                font-size: 13px;
                                line-height: 1.6;
                                text-align: center;
                              "
                            >
                              Si tenés alguna consulta sobre tu envío,
                              podés comunicarte con TECNO 3D.
                            </p>

                          </td>
                        </tr>

                        <!-- FOOTER -->
                        <tr>
                          <td
                            align="center"
                            style="
                              padding: 24px 32px;
                              background-color: #fafafa;
                              border-top: 1px solid #e5e7eb;
                            "
                          >
                            <p
                              style="
                                margin: 0 0 6px;
                                color: #374151;
                                font-size: 13px;
                                font-weight: bold;
                              "
                            >
                              TECNO 3D
                            </p>

                            <p
                              style="
                                margin: 0;
                                color: #9ca3af;
                                font-size: 12px;
                                line-height: 1.5;
                              "
                            >
                              Este correo fue enviado automáticamente.
                            </p>
                          </td>
                        </tr>

                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `,
        });

        console.log(
          `📧 Notificación de envío enviada para el pedido ${updatedOrder.id}.`
        );
      }
    } catch (emailError) {
      // IMPORTANTE:
      // El correo es una notificación secundaria.
      // Si Gmail falla, NO hacemos rollback del pedido.

      console.error(
        `⚠️ El pedido ${updatedOrder.id} quedó en SHIPPED, pero no se pudo enviar el email.`
      );

      console.error(
        "Error de Gmail:",
        emailError
      );
    }
  }

  return updatedOrder;
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