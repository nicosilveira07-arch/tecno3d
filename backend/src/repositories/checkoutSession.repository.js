import prisma from "../lib/prisma.js";

const createCheckoutSession = async (
data
) => {
return await prisma.checkoutSession.create({
data,


include: {
  items: {
    include: {
      product: true,
    },
  },

  address: true,

  coupon: true,

  user: true,
},


});
};

const getCheckoutSessionById = async (
id,
userId
) => {
return await prisma.checkoutSession.findFirst({
where: {
id,
userId,
},


include: {
  items: {
    include: {
      product: true,
    },
  },

  address: true,

  coupon: true,

  user: true,
},


});
};

// ======================================================
// OBTENER CHECKOUT SESSION DESDE WEBHOOK
// ======================================================
//
// El webhook de Mercado Pago no tiene un usuario
// autenticado. Por eso esta consulta utiliza únicamente
// el ID de la sesión.
//
// Esta función NO se utiliza desde endpoints públicos
// autenticados por el cliente.
// ======================================================

const getCheckoutSessionByIdForWebhook =
async (id) => {
return await prisma.checkoutSession.findUnique({
where: {
id,
},


  include: {
    items: {
      include: {
        product: true,
      },
    },

    address: true,

    coupon: true,

    user: true,
  },
});


};

const getActiveCheckoutSessionByUser =
async (userId) => {
return await prisma.checkoutSession.findFirst({
where: {
userId,


    status: "ACTIVE",
  },

  include: {
    items: {
      include: {
        product: true,
      },
    },

    address: true,

    coupon: true,

    user: true,
  },

  orderBy: {
    createdAt: "desc",
  },
});


};

const updateCheckoutSession = async (
id,
data
) => {
return await prisma.checkoutSession.update({
where: {
id,
},


data,

include: {
  items: {
    include: {
      product: true,
    },
  },

  address: true,

  coupon: true,

  user: true,
},


});
};

const updateCheckoutSessionStatus = async (
id,
status,
paymentData = {}
) => {
return await prisma.checkoutSession.update({
where: {
id,
},


data: {
  status,

  ...paymentData,
},

include: {
  items: {
    include: {
      product: true,
    },
  },

  address: true,

  coupon: true,

  user: true,
},


});
};

const deleteCheckoutSession = async (
id,
userId
) => {
return await prisma.checkoutSession.deleteMany({
where: {
id,


  userId,
},


});
};
// ======================================================
// CHECKOUTS EN TRÁMITE DEL USUARIO
// ======================================================

const getPendingCheckoutSessionsByUser =
  async (userId) => {
    return await prisma.checkoutSession.findMany({
      where: {
        userId,

        status: {
          in: [
            "PAYMENT_PENDING",
            "EXPIRED",
          ],
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

        user: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  };

// ======================================================
// CHECKOUTS EN TRÁMITE PARA ADMIN
// ======================================================

const getPendingCheckoutSessions =
  async () => {
    return await prisma.checkoutSession.findMany({
      where: {
        status: {
          in: [
            "PAYMENT_PENDING",
            "EXPIRED",
          ],
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

        user: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  };

const getExpiredCheckoutSessions =
async () => {
return await prisma.checkoutSession.findMany({
where: {
expiresAt: {
lt: new Date(),
},


    status: {
      in: [
        "ACTIVE",
        "PAYMENT_PENDING",
      ],
    },
  },

  include: {
    items: true,
  },
});


};

const deleteCheckoutSessionItems =
async (
checkoutSessionId
) => {
return await prisma.checkoutSessionItem.deleteMany({
where: {
checkoutSessionId,
},
});
};

const addCheckoutSessionItem =
async (data) => {
return await prisma.checkoutSessionItem.create({
data,


  include: {
    product: true,
  },
});


};

// ======================================================
// FINALIZAR CHECKOUT SESSION → ORDER REAL
// ======================================================
//
// Esta operación se ejecuta dentro de UNA transacción.
//
// Hace:
//
// 1. Verifica que la sesión siga PAYMENT_PENDING.
// 2. Verifica stock.
// 3. Crea Order CONFIRMED.
// 4. Crea OrderItems.
// 5. Crea Payment PAID.
// 6. Incrementa el uso del cupón.
// 7. Descuenta stock.
// 8. Marca CheckoutSession COMPLETED.
//
// Si cualquier paso falla, Prisma revierte TODO.
// ======================================================

const completeCheckoutSessionAsOrder =
async (
checkoutSessionId,
paymentTransactionId
) => {
return await prisma.$transaction(
async (tx) => {
const session =
await tx.checkoutSession.findUnique({
where: {
id: checkoutSessionId,
},


        include: {
          items: true,

          coupon: true,

          address: true,

          user: true,
        },
      });

    if (!session) {
      throw new Error(
        "Sesión de checkout no encontrada."
      );
    }

    // Si el webhook llega nuevamente después
    // de haber completado la sesión, no crear
    // un segundo pedido.

    if (
      session.status === "COMPLETED"
    ) {
      return {
        alreadyCompleted: true,
        order: null,
      };
    }

    if (
      session.status !==
      "PAYMENT_PENDING"
    ) {
      throw new Error(
        "La sesión de checkout no está esperando un pago."
      );
    }

    if (
      session.paymentStatus !==
      "PENDING"
    ) {
      throw new Error(
        "La sesión no tiene un pago pendiente válido."
      );
    }

    if (
      session.expiresAt <= new Date()
    ) {
      throw new Error(
        "La sesión de checkout ha vencido."
      );
    }

    if (
      !session.items ||
      session.items.length === 0
    ) {
      throw new Error(
        "La sesión de checkout no contiene productos."
      );
    }

    // ==================================================
    // VALIDAR STOCK
    // ==================================================

    for (
      const item of session.items
    ) {
      if (!item.productId) {
        throw new Error(
          `El producto "${item.productName}" ya no está disponible.`
        );
      }

      const product =
        await tx.product.findUnique({
          where: {
            id: item.productId,
          },

          select: {
            id: true,
            name: true,
            stock: true,
          },
        });

      if (!product) {
        throw new Error(
          `El producto "${item.productName}" ya no existe.`
        );
      }

      if (
        product.stock <
        item.quantity
      ) {
        throw new Error(
          `Stock insuficiente para ${product.name}.`
        );
      }
    }

    // ==================================================
    // CREAR ORDER REAL
    // ==================================================

    const order =
      await tx.order.create({
        data: {
          userId:
            session.userId,

          total:
            Number(session.total),

          discount:
            Number(session.discount),

          couponId:
            session.couponId,

          status:
            "CONFIRMED",

          deliveryMethod:
            session.deliveryMethod,

          addressId:
            session.addressId,

          items: {
            create:
              session.items.map(
                (item) => ({
                  quantity:
                    item.quantity,

                  price:
                    Number(item.price),

                  productName:
                    item.productName,

                  productId:
                    item.productId,
                })
              ),
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

          user: true,
        },
      });

    // ==================================================
    // CREAR PAYMENT REAL
    // ==================================================

    await tx.payment.create({
      data: {
        orderId:
          order.id,

        amount:
          Number(session.total),

        status:
          "PAID",

        method:
          session.paymentMethod ||
          "MERCADO_PAGO",

        transactionId:
          String(
            paymentTransactionId
          ),
      },
    });

    // ==================================================
    // INCREMENTAR CUPÓN
    // ==================================================

    if (
      session.couponId
    ) {
      await tx.coupon.update({
        where: {
          id:
            session.couponId,
        },

        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    // ==================================================
    // DESCONTAR STOCK
    // ==================================================

    for (
      const item of session.items
    ) {
      const result =
        await tx.product.updateMany({
          where: {
            id:
              item.productId,

            stock: {
              gte:
                item.quantity,
            },
          },

          data: {
            stock: {
              decrement:
                item.quantity,
            },
          },
        });

      if (
        result.count === 0
      ) {
        throw new Error(
          `No se pudo actualizar el stock de ${item.productName}.`
        );
      }
    }

    // ==================================================
    // FINALIZAR SESSION
    // ==================================================

    await tx.checkoutSession.update({
      where: {
        id:
          session.id,
      },

      data: {
        status:
          "COMPLETED",

        paymentStatus:
          "PAID",

        paymentTransactionId:
          String(
            paymentTransactionId
          ),
      },
    });

    // Recuperar el pedido incluyendo
    // el Payment recién creado.

    const completedOrder =
      await tx.order.findUnique({
        where: {
          id:
            order.id,
        },

        include: {
          items: {
            include: {
              product: true,
            },
          },

          payment: true,

          address: true,

          coupon: true,

          user: true,
        },
      });

    return {
      alreadyCompleted: false,

      order:
        completedOrder,
    };
  }
);


};

export {
  createCheckoutSession,
  getCheckoutSessionById,
  getCheckoutSessionByIdForWebhook,
  getActiveCheckoutSessionByUser,
  getPendingCheckoutSessionsByUser,
  getPendingCheckoutSessions,
  updateCheckoutSession,
  updateCheckoutSessionStatus,
  deleteCheckoutSession,
  getExpiredCheckoutSessions,
  deleteCheckoutSessionItems,
  addCheckoutSessionItem,
  completeCheckoutSessionAsOrder,
};
