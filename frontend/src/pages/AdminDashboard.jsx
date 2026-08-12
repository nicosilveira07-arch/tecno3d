import { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Loader2,
} from "lucide-react";

import { getDashboard } from "../services/dashboard.api";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [period, setPeriod] = useState("month");

  const dateRange = useMemo(() => {
    const now = new Date();

    if (period === "previous") {
      const start = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );

      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
      );

      return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      };
    }

    if (period === "3months") {
      const start = new Date(
        now.getFullYear(),
        now.getMonth() - 2,
        1,
      );

      const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      );

      return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      };
    }

    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );

    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    );

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [period]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDashboard({
          ...dateRange,
          lowStockLimit: 5,
        });

        setDashboard(response.data);
      } catch (err) {
        console.error("Error cargando dashboard:", err);

        setError(
          err?.response?.data?.message ||
            "No se pudo cargar el dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [dateRange]);

  const overview = dashboard?.overview || {};

  const salesByPeriod =
    dashboard?.salesByPeriod || [];

  const salesByCategory =
    dashboard?.salesByCategory || [];

  const topProducts =
    dashboard?.topProducts || [];

  const recentOrders =
    dashboard?.recentOrders || [];

  const paymentStats =
    dashboard?.paymentStats || [];

  const lowStockProducts =
    dashboard?.lowStockProducts || [];

  const formatCurrency = (value = 0) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  const formatNumber = (value = 0) => {
    return new Intl.NumberFormat("es-UY").format(
      Number(value) || 0,
    );
  };

  const getOrderStatusClasses = (status) => {
    const classes = {
      PENDING:
        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",

      CONFIRMED:
        "bg-blue-500/10 text-blue-400 border-blue-500/20",

      PROCESSING:
        "bg-purple-500/10 text-purple-400 border-purple-500/20",

      SHIPPED:
        "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",

      DELIVERED:
        "bg-green-500/10 text-green-400 border-green-500/20",

      CANCELLED:
        "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
      classes[status] ||
      "bg-zinc-800 text-zinc-400 border-zinc-700"
    );
  };

  const getOrderStatusLabel = (status) => {
    const labels = {
      PENDING: "Pendiente",
      CONFIRMED: "Confirmado",
      PROCESSING: "Preparando",
      SHIPPED: "Enviado",
      DELIVERED: "Entregado",
      CANCELLED: "Cancelado",
    };

    return labels[status] || status;
  };

  const maxSalesValue = Math.max(
    ...salesByPeriod.map((item) =>
      Number(item.total || item.sales || 0),
    ),
    1,
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex items-center gap-3 text-zinc-400">
          <Loader2
            size={22}
            className="animate-spin"
          />

          <span>Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 md:p-8">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          <h2 className="font-bold text-red-400">
            Error al cargar el dashboard
          </h2>

          <p className="mt-2 text-sm text-red-300">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-8">
      {/* HEADER */}

      <div className="mb-8">
        <p className="mb-2 text-sm text-zinc-500">
          Administración
        </p>

        <h1 className="text-3xl font-black text-white md:text-4xl">
          Dashboard
        </h1>
      </div>

      {/* KPIs */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Ventas totales",
            value: formatCurrency(
              overview.totalSales,
            ),
            icon: DollarSign,
            iconStyle:
              "bg-red-500/10 text-red-500",
          },
          {
            title: "Pedidos totales",
            value: formatNumber(
              overview.totalOrders,
            ),
            icon: ShoppingCart,
            iconStyle:
              "bg-zinc-800 text-zinc-300",
          },
          {
            title: "Clientes registrados",
            value: formatNumber(
              overview.totalCustomers,
            ),
            icon: Users,
            iconStyle:
              "bg-zinc-800 text-zinc-300",
          },
          {
            title: "Productos",
            value: formatNumber(
              overview.totalProducts,
            ),
            icon: Package,
            iconStyle:
              "bg-zinc-800 text-zinc-300",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-500">
                    {stat.title}
                  </p>

                  <p className="mt-3 text-2xl font-black text-white">
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${stat.iconStyle}`}
                >
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONTENIDO PRINCIPAL */}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* VENTAS */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Ventas
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Rendimiento del período
              </p>
            </div>

            <select
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value)
              }
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 outline-none"
            >
              <option value="month">
                Este mes
              </option>

              <option value="previous">
                Mes anterior
              </option>

              <option value="3months">
                Últimos 3 meses
              </option>
            </select>
          </div>

          {salesByPeriod.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-600">
              No hay ventas registradas.
            </div>
          ) : (
            <>
              <div className="flex h-64 items-end justify-between gap-2 border-b border-zinc-800 px-2 pb-2">
                {salesByPeriod.map(
                  (item, index) => {
                    const value = Number(
                      item.total ||
                        item.sales ||
                        0,
                    );

                    const height =
                      (value / maxSalesValue) *
                      100;

                    return (
                      <div
                        key={
                          item.date ||
                          item.period ||
                          index
                        }
                        className="flex h-full flex-1 items-end"
                      >
                        <div
                          className="w-full rounded-t bg-red-600/70 transition hover:bg-red-500"
                          style={{
                            height: `${Math.max(
                              height,
                              2,
                            )}%`,
                          }}
                          title={formatCurrency(
                            value,
                          )}
                        />
                      </div>
                    );
                  },
                )}
              </div>

              <div className="mt-3 flex justify-between overflow-hidden text-xs text-zinc-600">
                {salesByPeriod
                  .slice(0, 7)
                  .map((item, index) => (
                    <span key={index}>
                      {item.label ||
                        item.date ||
                        item.period ||
                        ""}
                    </span>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* VENTAS POR CATEGORÍA */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">
              Ventas por categoría
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Distribución de ventas
            </p>
          </div>

          {salesByCategory.length === 0 ? (
            <div className="flex h-52 items-center justify-center text-sm text-zinc-600">
              No hay ventas por categoría.
            </div>
          ) : (
            <div className="space-y-4">
              {salesByCategory.map(
                (category, index) => {
                  const percentage =
                    Number(
                      category.percentage ||
                        category.percent ||
                        0,
                    );

                  return (
                    <div
                      key={
                        category.categoryId ||
                        category.category ||
                        index
                      }
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-zinc-400">
                          {category.categoryName ||
                            category.category ||
                            "Sin categoría"}
                        </span>

                        <strong className="text-sm text-white">
                          {percentage.toFixed(1)}%
                        </strong>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-red-500"
                          style={{
                            width: `${Math.min(
                              percentage,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>

        {/* PEDIDOS RECIENTES */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Pedidos recientes
            </h2>

            <button className="text-sm font-semibold text-red-500 hover:text-red-400">
              Ver todos
            </button>
          </div>

          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-600">
                No hay pedidos recientes.
              </p>
            ) : (
              recentOrders
                .slice(0, 5)
                .map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-white">
                        #{order.id}
                      </p>

                      <p className="truncate text-xs text-zinc-500">
                        {order.user
                          ? `${order.user.firstName || ""} ${
                              order.user.lastName || ""
                            }`.trim()
                          : order.customerName ||
                            "Cliente"}
                      </p>
                    </div>

                    <p className="whitespace-nowrap text-sm font-semibold text-white">
                      {formatCurrency(
                        order.total,
                      )}
                    </p>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getOrderStatusClasses(
                        order.status,
                      )}`}
                    >
                      {getOrderStatusLabel(
                        order.status,
                      )}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* SEGUNDA FILA */}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* PRODUCTOS MÁS VENDIDOS */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">
              Productos más vendidos
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Productos con mayor cantidad de ventas
            </p>
          </div>

          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-600">
                No hay ventas de productos.
              </p>
            ) : (
              topProducts
                .slice(0, 5)
                .map((product, index) => (
                  <div
                    key={
                      product.productId ||
                      product.id ||
                      index
                    }
                    className="flex items-center gap-3 border-b border-zinc-800 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-sm font-bold text-zinc-300">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">
                        {product.productName ||
                          product.name ||
                          "Producto"}
                      </p>

                      <p className="text-xs text-zinc-500">
                        {formatNumber(
                          product.quantity ||
                            product.totalSold ||
                            0,
                        )}{" "}
                        vendidos
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* ESTADO DE PAGOS */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
              <CreditCard size={19} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Estado de pagos
              </h2>

              <p className="text-sm text-zinc-500">
                Situación de los pagos
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {paymentStats.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-600">
                No hay pagos registrados.
              </p>
            ) : (
              paymentStats.map(
                (payment, index) => (
                  <div
                    key={
                      payment.status ||
                      index
                    }
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-zinc-400">
                      {payment.label ||
                        payment.status}
                    </span>

                    <span className="font-bold text-white">
                      {formatNumber(
                        payment.count,
                      )}
                    </span>
                  </div>
                ),
              )
            )}
          </div>
        </div>

        {/* STOCK */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
              <AlertTriangle size={19} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Stock bajo
              </h2>

              <p className="text-sm text-zinc-500">
                Productos que requieren reposición
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {lowStockProducts.length ===
            0 ? (
              <div className="flex items-center gap-2 py-8 text-sm text-green-500">
                <Package size={17} />

                <span>
                  No hay productos con stock bajo.
                </span>
              </div>
            ) : (
              lowStockProducts
                .slice(0, 5)
                .map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {product.name}
                      </p>

                      <p className="text-xs text-zinc-500">
                        Stock actual
                      </p>
                    </div>

                    <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">
                      {product.stock}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}