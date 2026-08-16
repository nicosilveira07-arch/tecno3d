import prisma from "../lib/prisma.js";

/*
 * ============================================================
 * CONFIGURACIÓN
 * ============================================================
 */

const MAX_RECENT_ORDERS = 5;
const MAX_TOP_PRODUCTS = 20;
const MAX_LOW_STOCK_PRODUCTS = 5;

/*
 * ============================================================
 * DASHBOARD
 * ============================================================
 */

const getDashboardData = async ({
  startDate,
  endDate,
  lowStockLimit = 5,
}) => {
  /*
   * ==========================================================
   * FILTRO GENERAL DE FECHAS
   * ==========================================================
   */

  const dateFilter = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  /*
   * ==========================================================
   * CONSULTAS
   * ==========================================================
   *
   * IMPORTANTE:
   *
   * No traemos grandes cantidades de datos a Node.js.
   *
   * Los cálculos comerciales se realizan directamente
   * en PostgreSQL.
   */

  const [
    totalCustomers,
    totalProducts,
    totalOrders,
    cancelledOrders,
    paidSales,
    totalProductsSold,
    recentOrders,
    paymentStats,
    lowStockProducts,
    salesByPeriodRaw,
    salesByCategoryRaw,
    topProductsRaw,
  ] = await Promise.all([
    /*
     * --------------------------------------------------------
     * CLIENTES
     * --------------------------------------------------------
     *
     * Total general de clientes registrados.
     */

    prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    }),

    /*
     * --------------------------------------------------------
     * PRODUCTOS
     * --------------------------------------------------------
     *
     * Total general del catálogo.
     */

    prisma.product.count(),

    /*
     * --------------------------------------------------------
     * PEDIDOS
     * --------------------------------------------------------
     */

    prisma.order.count({
      where: dateFilter,
    }),

    /*
     * --------------------------------------------------------
     * PEDIDOS CANCELADOS
     * --------------------------------------------------------
     */

    prisma.order.count({
      where: {
        ...dateFilter,
        status: "CANCELLED",
      },
    }),

    /*
     * --------------------------------------------------------
     * VENTAS PAGADAS
     * --------------------------------------------------------
     *
     * Solamente necesitamos la suma.
     *
     * No traemos los pedidos individualmente.
     */

    prisma.order.aggregate({
      _sum: {
        total: true,
      },

      where: {
        ...dateFilter,

        payment: {
          status: "PAID",
        },
      },
    }),

    /*
     * --------------------------------------------------------
     * PRODUCTOS VENDIDOS
     * --------------------------------------------------------
     *
     * SUM(quantity) directamente en PostgreSQL.
     *
     * Solamente contabilizamos pedidos pagados.
     */

    prisma.orderItem.aggregate({
      _sum: {
        quantity: true,
      },

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
    }),

    /*
     * --------------------------------------------------------
     * PEDIDOS RECIENTES
     * --------------------------------------------------------
     *
     * Siempre mostramos los últimos pedidos reales
     * del sistema.
     *
     * No dependen del filtro del dashboard.
     *
     * Máximo: 5.
     */

    prisma.order.findMany({
      take: MAX_RECENT_ORDERS,

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

    /*
     * --------------------------------------------------------
     * ESTADO DE PAGOS
     * --------------------------------------------------------
     *
     * IMPORTANTE:
     *
     * El período se determina por Order.createdAt.
     *
     * NO utilizamos Payment.createdAt porque una venta
     * puede haberse creado en un período y pagado después.
     *
     * De esta manera las métricas de pagos y ventas
     * utilizan el mismo período comercial.
     */

    prisma.payment.groupBy({
      by: ["status"],

      _count: {
        _all: true,
      },

      _sum: {
        amount: true,
      },

      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    }),

    /*
     * --------------------------------------------------------
     * STOCK BAJO
     * --------------------------------------------------------
     *
     * lowStockLimit = umbral de stock.
     *
     * MAX_LOW_STOCK_PRODUCTS = cantidad máxima
     * de productos devueltos.
     */

    prisma.product.findMany({
      where: {
        stock: {
          lte: lowStockLimit,
        },
      },

      orderBy: {
        stock: "asc",
      },

      take: MAX_LOW_STOCK_PRODUCTS,

      include: {
        category: true,
        brand: true,
      },
    }),

    /*
     * --------------------------------------------------------
     * VENTAS POR DÍA
     * --------------------------------------------------------
     *
     * PostgreSQL realiza la agrupación.
     *
     * No traemos todos los pedidos pagados a Node.js.
     */

    prisma.$queryRaw`
      SELECT
        DATE_TRUNC('day', o."createdAt") AS date,

        COALESCE(
          SUM(o."total"),
          0
        ) AS sales,

        COUNT(o."id")::int AS orders

      FROM "Order" o

      INNER JOIN "Payment" p
        ON p."orderId" = o."id"

      WHERE
        o."createdAt" >= ${startDate}
        AND o."createdAt" <= ${endDate}
        AND p."status" = 'PAID'

      GROUP BY
        DATE_TRUNC('day', o."createdAt")

      ORDER BY
        date ASC
    `,

    /*
     * --------------------------------------------------------
     * VENTAS POR CATEGORÍA
     * --------------------------------------------------------
     *
     * Utilizamos OrderItem.price porque representa
     * el precio histórico de venta.
     *
     * NO utilizamos Product.price.
     */

    prisma.$queryRaw`
      SELECT
        COALESCE(
          c."id",
          'unknown'
        ) AS "categoryId",

        COALESCE(
          c."name",
          'Sin categoría'
        ) AS "categoryName",

        COALESCE(
          SUM(oi."quantity"),
          0
        )::int AS quantity,

        COALESCE(
          SUM(
            oi."price" * oi."quantity"
          ),
          0
        ) AS sales

      FROM "OrderItem" oi

      INNER JOIN "Order" o
        ON o."id" = oi."orderId"

      INNER JOIN "Payment" p
        ON p."orderId" = o."id"

      LEFT JOIN "Product" pr
        ON pr."id" = oi."productId"

      LEFT JOIN "Category" c
        ON c."id" = pr."categoryId"

      WHERE
        o."createdAt" >= ${startDate}
        AND o."createdAt" <= ${endDate}
        AND p."status" = 'PAID'

      GROUP BY
        c."id",
        c."name"

      ORDER BY
        sales DESC
    `,

    /*
     * --------------------------------------------------------
     * PRODUCTOS MÁS VENDIDOS
     * --------------------------------------------------------
     *
     * Máximo 20.
     *
     * PostgreSQL agrupa, calcula y ordena.
     */

    prisma.$queryRaw`
      SELECT
        pr."id" AS "productId",

        pr."name" AS name,

        pr."image" AS image,

        c."name" AS category,

        COALESCE(
          SUM(oi."quantity"),
          0
        )::int AS quantity,

        COALESCE(
          SUM(
            oi."price" * oi."quantity"
          ),
          0
        ) AS sales

      FROM "OrderItem" oi

      INNER JOIN "Order" o
        ON o."id" = oi."orderId"

      INNER JOIN "Payment" p
        ON p."orderId" = o."id"

      INNER JOIN "Product" pr
        ON pr."id" = oi."productId"

      LEFT JOIN "Category" c
        ON c."id" = pr."categoryId"

      WHERE
        o."createdAt" >= ${startDate}
        AND o."createdAt" <= ${endDate}
        AND p."status" = 'PAID'

      GROUP BY
        pr."id",
        pr."name",
        pr."image",
        c."name"

      ORDER BY
        quantity DESC

      LIMIT ${MAX_TOP_PRODUCTS}
    `,
  ]);

  /*
   * ==========================================================
   * NORMALIZAR VENTAS
   * ==========================================================
   */

  const totalSales = Number(
    paidSales?._sum?.total ?? 0,
  );

  /*
   * ==========================================================
   * NORMALIZAR PRODUCTOS VENDIDOS
   * ==========================================================
   */

  const normalizedTotalProductsSold =
    Number(
      totalProductsSold?._sum?.quantity ?? 0,
    );

  /*
   * ==========================================================
   * VENTAS POR PERÍODO
   * ==========================================================
   */

  const salesByPeriod =
    salesByPeriodRaw.map((item) => {
      const date =
        item.date instanceof Date
          ? item.date
              .toISOString()
              .split("T")[0]
          : String(item.date).split("T")[0];

      return {
        date,
        sales: Number(item.sales ?? 0),
        orders: Number(item.orders ?? 0),
      };
    });

  /*
   * ==========================================================
   * VENTAS POR CATEGORÍA
   * ==========================================================
   */

  const salesByCategory =
    salesByCategoryRaw.map(
      (category) => ({
        categoryId:
          category.categoryId,

        categoryName:
          category.categoryName ||
          "Sin categoría",

        quantity:
          Number(
            category.quantity ?? 0,
          ),

        sales:
          Number(
            category.sales ?? 0,
          ),
      }),
    );

  /*
   * ==========================================================
   * PRODUCTOS MÁS VENDIDOS
   * ==========================================================
   */

  const topProducts =
    topProductsRaw.map(
      (product) => ({
        productId:
          product.productId,

        name:
          product.name,

        image:
          product.image,

        category:
          product.category ||
          null,

        quantity:
          Number(
            product.quantity ?? 0,
          ),

        sales:
          Number(
            product.sales ?? 0,
          ),
      }),
    );

  /*
   * ==========================================================
   * ESTADOS DE PAGO
   * ==========================================================
   */

  const paymentStatusLabels = {
    PENDING: "Pendientes",
    PAID: "Pagados",
    FAILED: "Fallidos",
    REFUNDED: "Reembolsados",
  };

  const normalizedPaymentStats =
    paymentStats.map(
      (payment) => ({
        status:
          payment.status,

        label:
          paymentStatusLabels[
            payment.status
          ] ||
          payment.status,

        count:
          Number(
            payment._count?._all ?? 0,
          ),

        amount:
          Number(
            payment._sum?.amount ?? 0,
          ),
      }),
    );

  /*
   * ==========================================================
   * RESPUESTA FINAL
   * ==========================================================
   *
   * Esta estructura coincide con
   * AdminDashboard.jsx.
   */

  return {
    overview: {
      totalSales,

      totalOrders:
        Number(totalOrders),

      cancelledOrders:
        Number(cancelledOrders),

      totalCustomers:
        Number(totalCustomers),

      totalProducts:
        Number(totalProducts),

      totalProductsSold:
        normalizedTotalProductsSold,
    },

    salesByPeriod,

    salesByCategory,

    topProducts,

    recentOrders,

    paymentStats:
      normalizedPaymentStats,

    lowStockProducts,
  };
};

export {
  getDashboardData,
};