import prisma from "../lib/prisma.js";

const getDashboardData = async ({
  startDate,
  endDate,
  lowStockLimit = 5,
}) => {
  const dateFilter = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  const [
    totalCustomers,
    totalProducts,
    totalOrders,
    cancelledOrders,
    paidOrders,
    recentOrders,
    paymentStats,
    lowStockProducts,
    orderItems,
  ] = await Promise.all([
    // CLIENTES
    prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    }),

    // PRODUCTOS
    prisma.product.count(),

    // PEDIDOS
    prisma.order.count({
      where: dateFilter,
    }),

    // PEDIDOS CANCELADOS
    prisma.order.count({
      where: {
        ...dateFilter,
        status: "CANCELLED",
      },
    }),

    // PEDIDOS PAGADOS
    prisma.order.findMany({
      where: {
        ...dateFilter,
        payment: {
          status: "PAID",
        },
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    // PEDIDOS RECIENTES
    prisma.order.findMany({
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payment: {
          select: {
            status: true,
            method: true,
          },
        },
        items: {
          select: {
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    }),

    // ESTADO DE PAGOS
    prisma.payment.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
      _sum: {
        amount: true,
      },
      where: {},
    }),

    // STOCK BAJO
    prisma.product.findMany({
      where: {
        stock: {
          lte: lowStockLimit,
        },
      },
      orderBy: {
        stock: "asc",
      },
      take: 10,
      include: {
        category: true,
        brand: true,
      },
    }),

    // PRODUCTOS VENDIDOS
    prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          payment: {
            status: "PAID",
          },
        },
      },
      select: {
        productId: true,
        quantity: true,
        price: true,
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // =========================
  // VENTAS TOTALES
  // =========================

  const totalSales = paidOrders.reduce(
    (total, order) => total + order.total,
    0,
  );

  // =========================
  // VENTAS POR PERÍODO
  // =========================

  const salesByPeriod = {};

  for (const order of paidOrders) {
    const date = order.createdAt
      .toISOString()
      .split("T")[0];

    if (!salesByPeriod[date]) {
      salesByPeriod[date] = {
        date,
        sales: 0,
        orders: 0,
      };
    }

    salesByPeriod[date].sales += order.total;
    salesByPeriod[date].orders += 1;
  }

  const salesByPeriodResult = Object.values(
    salesByPeriod,
  ).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // =========================
  // PRODUCTOS MÁS VENDIDOS
  // =========================

  const productsMap = new Map();

  for (const item of orderItems) {
    if (!productsMap.has(item.productId)) {
      productsMap.set(item.productId, {
        productId: item.productId,
        name: item.product.name,
        image: item.product.image,
        category:
          item.product.category?.name || null,
        quantity: 0,
        sales: 0,
      });
    }

    const product = productsMap.get(
      item.productId,
    );

    product.quantity += item.quantity;

    product.sales +=
      item.price * item.quantity;
  }

  const topProducts = Array.from(
    productsMap.values(),
  )
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // =========================
  // VENTAS POR CATEGORÍA
  // =========================

  const categoriesMap = new Map();

  for (const item of orderItems) {
    const categoryId =
      item.product.category?.id || "unknown";

    const categoryName =
      item.product.category?.name ||
      "Sin categoría";

    if (!categoriesMap.has(categoryId)) {
      categoriesMap.set(categoryId, {
        categoryId,
        categoryName,
        quantity: 0,
        sales: 0,
      });
    }

    const category =
      categoriesMap.get(categoryId);

    category.quantity += item.quantity;

    category.sales +=
      item.price * item.quantity;
  }

  const salesByCategory =
    Array.from(categoriesMap.values()).sort(
      (a, b) => b.sales - a.sales,
    );

  // =========================
  // TOTAL DE PRODUCTOS VENDIDOS
  // =========================

  const totalProductsSold =
    orderItems.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );

  // =========================
  // ESTADO DE PAGOS
  // =========================

  const paymentStatusLabels = {
    PENDING: "Pendientes",
    PAID: "Pagados",
    FAILED: "Fallidos",
    REFUNDED: "Reembolsados",
  };

  const normalizedPaymentStats =
    paymentStats.map((payment) => ({
      status: payment.status,
      label:
        paymentStatusLabels[payment.status] ||
        payment.status,
      count: payment._count._all,
      amount: payment._sum.amount || 0,
    }));

  // =========================
  // RESPUESTA DASHBOARD
  // =========================

  return {
    overview: {
      totalSales,
      totalOrders,
      cancelledOrders,
      totalCustomers,
      totalProducts,
      totalProductsSold,
    },

    salesByPeriod: salesByPeriodResult,

    salesByCategory,

    topProducts,

    recentOrders,

    paymentStats: normalizedPaymentStats,

    lowStockProducts,
  };
};

export {
  getDashboardData,
};