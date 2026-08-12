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



const updateOrderStatus = async (
  id,
  status,
  shippingData = {}
) => {
  return await prisma.order.update({
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
};



export {
  createOrder,
  getOrdersByUser,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};

