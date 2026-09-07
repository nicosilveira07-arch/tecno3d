import prisma from "../lib/prisma.js";

const createOrder = async (data) => {
  return await prisma.order.create({
    data,
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

const getOrdersByUser = async (userId) => {
  return await prisma.order.findMany({
    where: {
      userId,
    },

    include: {
      items: {
        include: {
          product: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      user: true,

      payment: true,

      items: {
        include: {
          product: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const getOrderById = async (id) => {
  return await prisma.order.findUnique({
    where: {
      id,
    },

    include: {
      user: true,

      payment: true,

      address: true,

      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

const getPendingOrderByUser = async (userId) => {
  return await prisma.order.findFirst({
    where: {
      userId,
      status: "PENDING",
    },

    include: {
      payment: true,

      address: true,

      items: {
        include: {
          product: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const getPendingOrderById = async (
  id,
  userId
) => {
  return await prisma.order.findFirst({
    where: {
      id,
      userId,
      status: "PENDING",
    },

    include: {
      payment: true,

      address: true,

      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

const cancelPendingOrder = async (
  id,
  userId
) => {
  return await prisma.$transaction(
    async (tx) => {
      const result =
        await tx.order.updateMany({
          where: {
            id,
            userId,
            status: "PENDING",
          },

          data: {
            status: "CANCELLED",
          },
        });

      if (result.count === 0) {
        return null;
      }

      return await tx.order.findUnique({
        where: {
          id,
        },

        include: {
          user: true,

          payment: true,

          address: true,

          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }
  );
};

const updateOrderStatus = async (
  id,
  status,
  shippingData = {}
) => {
  return await prisma.$transaction(async (tx) => {
    const currentOrder =
      await tx.order.findUnique({
        where: {
          id,
        },

        select: {
          deliveryMethod: true,
        },
      });

    if (!currentOrder) {
      throw new Error(
        "Pedido no encontrado."
      );
    }

    const order =
      await tx.order.update({
        where: {
          id,
        },

        data: {
          status,

          ...shippingData,
        },

        include: {
          user: true,

          payment: true,

          address: true,

          items: {
            include: {
              product: true,
            },
          },
        },
      });

    // RETIRO EN LOCAL:
    // cuando el pedido se entrega al cliente,
    // la operación económica queda finalizada.
    //
    // Solo actualizamos el pago si existe.
    // No creamos un Payment nuevo porque el modelo
    // requiere un método de pago obligatorio.

    if (
      currentOrder.deliveryMethod ===
        "PICKUP" &&
      status === "DELIVERED"
    ) {
      await tx.payment.updateMany({
        where: {
          orderId: id,
        },

        data: {
          status: "PAID",
        },
      });
    }

    return await tx.order.findUnique({
      where: {
        id,
      },

      include: {
        user: true,

        payment: true,

        address: true,

        items: {
          include: {
            product: true,
          },
        },
      },
    });
  });
};

export {
  createOrder,
  getOrdersByUser,
  getAllOrders,
  getOrderById,
  getPendingOrderByUser,
  getPendingOrderById,
  cancelPendingOrder,
  updateOrderStatus,
};

