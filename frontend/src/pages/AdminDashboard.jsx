import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  CreditCard,
  Loader2,
  ArrowLeft,
  BarChart3,
  XCircle,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

import { getDashboard } from "../services/dashboard.api";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ============================================================
   * FILTRO GENERAL
   * ============================================================
   */

  const [period, setPeriod] = useState("month");

  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  /*
   * ============================================================
   * ANÁLISIS ABIERTO
   * ============================================================
   */

  const [activeAnalysis, setActiveAnalysis] = useState(null);

  /*
   * ============================================================
   * FECHA LOCAL
   * ============================================================
   */

  const getLocalDateString = (date) => {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /*
   * ============================================================
   * RANGO DE FECHAS
   * ============================================================
   */

  const dateRange = useMemo(() => {
    const now = new Date();

    /*
     * PERÍODO PERSONALIZADO
     */

    if (period === "custom") {
      return {
        startDate: customStartDate || null,
        endDate: customEndDate || null,
      };
    }

    /*
     * MES ANTERIOR
     */

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
        startDate: getLocalDateString(start),
        endDate: getLocalDateString(end),
      };
    }

    /*
     * ÚLTIMOS 3 MESES
     */

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
        startDate: getLocalDateString(start),
        endDate: getLocalDateString(end),
      };
    }

    /*
     * ESTE MES
     */

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
      startDate: getLocalDateString(start),
      endDate: getLocalDateString(end),
    };
  }, [
    period,
    customStartDate,
    customEndDate,
  ]);

  /*
   * ============================================================
   * CARGAR DASHBOARD
   * ============================================================
   */

  useEffect(() => {
    /*
     * Período personalizado incompleto.
     */

    if (
      period === "custom" &&
      (!dateRange.startDate || !dateRange.endDate)
    ) {
      setLoading(false);
      setError("");
      return;
    }

    /*
     * Validación de fechas.
     */

    if (
      dateRange.startDate &&
      dateRange.endDate &&
      dateRange.startDate > dateRange.endDate
    ) {
      setLoading(false);

      setError(
        "La fecha inicial no puede ser posterior a la fecha final.",
      );

      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDashboard({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,

          /*
           * El dashboard solamente necesita
           * una pequeña muestra de stock.
           */

          lowStockLimit: 5,
        });

        setDashboard(response.data);
      } catch (err) {
        console.error(
          "Error cargando dashboard:",
          err,
        );

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

  /*
   * ============================================================
   * DATOS DEL DASHBOARD
   * ============================================================
   */

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

  /*
   * ============================================================
   * FORMATOS
   * ============================================================
   */

  const formatCurrency = (value = 0) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  const formatNumber = (value = 0) => {
    return new Intl.NumberFormat("es-UY").format(
      Number(value) || 0,
    );
  };

  /*
   * ============================================================
   * CÁLCULOS DERIVADOS
   * ============================================================
   */

  const maxSalesValue = useMemo(() => {
    if (!salesByPeriod.length) {
      return 1;
    }

    return Math.max(
      ...salesByPeriod.map((item) =>
        Number(
          item.total ??
            item.sales ??
            0,
        ),
      ),
      1,
    );
  }, [salesByPeriod]);

  const maxCategorySales = useMemo(() => {
    if (!salesByCategory.length) {
      return 1;
    }

    return Math.max(
      ...salesByCategory.map((item) =>
        Number(item.sales || 0),
      ),
      1,
    );
  }, [salesByCategory]);

  const totalPaymentCount = useMemo(() => {
    return paymentStats.reduce(
      (total, payment) =>
        total + Number(payment.count || 0),
      0,
    );
  }, [paymentStats]);

  const productsBySales = useMemo(() => {
    return [...topProducts]
      .sort(
        (a, b) =>
          Number(b.sales || 0) -
          Number(a.sales || 0),
      )
      .slice(0, 20);
  }, [topProducts]);

  const averageOrderValue = useMemo(() => {
    const totalSales =
      Number(overview.totalSales) || 0;

    const totalOrders =
      Number(overview.totalOrders) || 0;

    if (totalOrders <= 0) {
      return 0;
    }

    return totalSales / totalOrders;
  }, [
    overview.totalSales,
    overview.totalOrders,
  ]);

  const cancellationRate = useMemo(() => {
    const totalOrders =
      Number(overview.totalOrders) || 0;

    const cancelledOrders =
      Number(overview.cancelledOrders) || 0;

    if (totalOrders <= 0) {
      return 0;
    }

    return (
      (cancelledOrders / totalOrders) *
      100
    );
  }, [
    overview.totalOrders,
    overview.cancelledOrders,
  ]);

  /*
   * ============================================================
   * PAGOS
   * ============================================================
   */

  const paidPayment = useMemo(
    () =>
      paymentStats.find(
        (payment) =>
          payment.status === "PAID",
      ),
    [paymentStats],
  );

  const pendingPayment = useMemo(
    () =>
      paymentStats.find(
        (payment) =>
          payment.status === "PENDING",
      ),
    [paymentStats],
  );

  const failedPayment = useMemo(
    () =>
      paymentStats.find(
        (payment) =>
          payment.status === "FAILED",
      ),
    [paymentStats],
  );

  const refundedPayment = useMemo(
    () =>
      paymentStats.find(
        (payment) =>
          payment.status === "REFUNDED",
      ),
    [paymentStats],
  );

  /*
   * ============================================================
   * ESTADOS DE PEDIDOS
   * ============================================================
   */

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

  /*
   * ============================================================
   * ANÁLISIS
   * ============================================================
   */

  const openAnalysis = (section) => {
    setActiveAnalysis(section);
  };

  const closeAnalysis = () => {
    setActiveAnalysis(null);
  };

  /*
   * ============================================================
   * CARGANDO
   * ============================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex items-center gap-3 text-zinc-400">
          <Loader2
            size={22}
            className="animate-spin"
          />

          <span>
            Cargando dashboard...
          </span>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

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

  /*
   * ============================================================
   * PERÍODO PERSONALIZADO SIN FECHAS
   * ============================================================
   */

  if (
    period === "custom" &&
    (!customStartDate || !customEndDate)
  ) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 md:p-8">
        <div className="mb-8">
          <p className="mb-2 text-sm text-zinc-500">
            Administración
          </p>

          <h1 className="text-3xl font-black text-white md:text-4xl">
            Dashboard
          </h1>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <CalendarDays
              size={19}
              className="text-red-500"
            />

            <span className="text-sm font-semibold text-zinc-300">
              Seleccioná una fecha inicial y una fecha final para consultar el período.
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) =>
                setCustomStartDate(
                  e.target.value,
                )
              }
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-red-500/50"
            />

            <input
              type="date"
              value={customEndDate}
              min={customStartDate || undefined}
              onChange={(e) =>
                setCustomEndDate(
                  e.target.value,
                )
              }
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-red-500/50"
            />
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * MODO ANÁLISIS
   * ============================================================
   */

  if (activeAnalysis) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 md:p-8">
        {/* HEADER */}

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={closeAnalysis}
              className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-white"
            >
              <ArrowLeft size={17} />

              Volver al dashboard
            </button>

            <p className="mb-2 text-sm text-zinc-500">
              Análisis comercial
            </p>

            <h1 className="text-3xl font-black text-white md:text-4xl">
              {activeAnalysis === "sales" &&
                "Análisis de ventas"}

              {activeAnalysis === "products" &&
                "Análisis de productos"}

              {activeAnalysis === "categories" &&
                "Análisis por categoría"}

              {activeAnalysis === "payments" &&
                "Análisis de pagos"}

              {activeAnalysis === "cancelled" &&
                "Análisis de pedidos cancelados"}

              {activeAnalysis === "stock" &&
                "Análisis de stock"}
            </h1>
          </div>

          <button
            type="button"
            onClick={closeAnalysis}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-zinc-700 hover:text-white"
          >
            <XCircle size={19} />
          </button>
        </div>

        {/* FILTROS */}

        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
              <CalendarDays size={17} />

              Período
            </div>

            <select
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value)
              }
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 outline-none transition focus:border-red-500/50"
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

              <option value="custom">
                Período personalizado
              </option>
            </select>

            {period === "custom" && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-500">
                    Desde
                  </label>

                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) =>
                      setCustomStartDate(
                        e.target.value,
                      )
                    }
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 outline-none transition focus:border-red-500/50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-500">
                    Hasta
                  </label>

                  <input
                    type="date"
                    value={customEndDate}
                    min={
                      customStartDate ||
                      undefined
                    }
                    onChange={(e) =>
                      setCustomEndDate(
                        e.target.value,
                      )
                    }
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 outline-none transition focus:border-red-500/50"
                  />
                </div>
              </>
            )}
          </div>

          {dateRange.startDate &&
            dateRange.endDate && (
              <p className="mt-3 text-xs text-zinc-600">
                Datos desde{" "}
                <span className="text-zinc-400">
                  {dateRange.startDate}
                </span>{" "}
                hasta{" "}
                <span className="text-zinc-400">
                  {dateRange.endDate}
                </span>
              </p>
            )}
        </div>

        {/* ======================================================
            VENTAS
        ====================================================== */}

        {activeAnalysis === "sales" && (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <p className="text-sm text-zinc-500">
                  Facturación
                </p>

                <p className="mt-3 text-3xl font-black text-white">
                  {formatCurrency(
                    overview.totalSales,
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <p className="text-sm text-zinc-500">
                  Pedidos
                </p>

                <p className="mt-3 text-3xl font-black text-white">
                  {formatNumber(
                    overview.totalOrders,
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <p className="text-sm text-zinc-500">
                  Productos vendidos
                </p>

                <p className="mt-3 text-3xl font-black text-white">
                  {formatNumber(
                    overview.totalProductsSold,
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <p className="text-sm text-zinc-500">
                  Cancelados
                </p>

                <p className="mt-3 text-3xl font-black text-red-400">
                  {formatNumber(
                    overview.cancelledOrders,
                  )}
                </p>
              </div>
            </div>

            {/* GRÁFICA */}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                    <BarChart3 size={21} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Ventas por período
                    </h2>

                    <p className="text-sm text-zinc-500">
                      Evolución de la facturación
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-500">
                  {salesByPeriod.length} registros
                </div>
              </div>

              {salesByPeriod.length === 0 ? (
                <div className="flex h-80 items-center justify-center text-sm text-zinc-600">
                  No hay ventas registradas.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div
                    className="flex h-80 items-end gap-2 border-b border-zinc-800 px-2 pb-2"
                    style={{
                      minWidth: `${Math.max(
                        salesByPeriod.length * 42,
                        100,
                      )}px`,
                    }}
                  >
                    {salesByPeriod.map(
                      (item, index) => {
                        const value = Number(
                          item.total ??
                            item.sales ??
                            0,
                        );

                        const height =
                          (value /
                            maxSalesValue) *
                          100;

                        return (
                          <div
                            key={
                              item.date ||
                              item.period ||
                              index
                            }
                            className="flex h-full min-w-[32px] flex-1 flex-col justify-end"
                          >
                            <div className="mb-2 text-center text-[10px] text-zinc-600">
                              {formatCurrency(
                                value,
                              )}
                            </div>

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

                            <div className="mt-2 whitespace-nowrap text-center text-[10px] text-zinc-600">
                              {item.label ||
                                item.date ||
                                item.period ||
                                ""}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RESUMEN */}

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-6 flex items-center gap-3">
                  <TrendingUp
                    size={20}
                    className="text-red-500"
                  />

                  <h2 className="text-lg font-bold text-white">
                    Resumen del período
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between border-b border-zinc-800 pb-4">
                    <span className="text-zinc-500">
                      Facturación total
                    </span>

                    <strong className="text-white">
                      {formatCurrency(
                        overview.totalSales,
                      )}
                    </strong>
                  </div>

                  <div className="flex justify-between border-b border-zinc-800 pb-4">
                    <span className="text-zinc-500">
                      Pedidos realizados
                    </span>

                    <strong className="text-white">
                      {formatNumber(
                        overview.totalOrders,
                      )}
                    </strong>
                  </div>

                  <div className="flex justify-between border-b border-zinc-800 pb-4">
                    <span className="text-zinc-500">
                      Productos vendidos
                    </span>

                    <strong className="text-white">
                      {formatNumber(
                        overview.totalProductsSold,
                      )}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">
                      Ticket promedio
                    </span>

                    <strong className="text-white">
                      {formatCurrency(
                        averageOrderValue,
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white">
                    Categorías con mayor facturación
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Comparación rápida
                  </p>
                </div>

                <div className="space-y-4">
                  {salesByCategory
                    .slice(0, 5)
                    .map(
                      (
                        category,
                        index,
                      ) => (
                        <div
                          key={
                            category.categoryId ||
                            index
                          }
                          className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0"
                        >
                          <div>
                            <p className="font-semibold text-white">
                              {category.categoryName ||
                                category.category ||
                                "Sin categoría"}
                            </p>

                            <p className="text-xs text-zinc-500">
                              {formatNumber(
                                category.quantity,
                              )}{" "}
                              unidades
                            </p>
                          </div>

                          <strong className="text-white">
                            {formatCurrency(
                              category.sales,
                            )}
                          </strong>
                        </div>
                      ),
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            PRODUCTOS
        ====================================================== */}

        {activeAnalysis === "products" && (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Productos más vendidos
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Ranking por unidades
                  </p>
                </div>

                <div className="space-y-4">
                  {topProducts.length === 0 ? (
                    <p className="py-8 text-center text-sm text-zinc-600">
                      No hay ventas registradas.
                    </p>
                  ) : (
                    topProducts
                      .slice(0, 20)
                      .map(
                        (
                          product,
                          index,
                        ) => (
                          <div
                            key={
                              product.productId ||
                              product.id ||
                              index
                            }
                            className="flex items-center gap-4 border-b border-zinc-800 pb-4 last:border-0"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 font-bold text-zinc-300">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-white">
                                {product.name ||
                                  product.productName ||
                                  "Producto"}
                              </p>

                              <p className="text-xs text-zinc-500">
                                {product.category ||
                                  product.categoryName ||
                                  "Sin categoría"}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-white">
                                {formatNumber(
                                  product.quantity ||
                                    product.totalSold ||
                                    0,
                                )}
                              </p>

                              <p className="text-xs text-zinc-500">
                                vendidos
                              </p>
                            </div>
                          </div>
                        ),
                      )
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Productos con mayor facturación
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Ranking económico
                  </p>
                </div>

                <div className="space-y-4">
                  {productsBySales.length === 0 ? (
                    <p className="py-8 text-center text-sm text-zinc-600">
                      No hay ventas registradas.
                    </p>
                  ) : (
                    productsBySales.map(
                      (
                        product,
                        index,
                      ) => (
                        <div
                          key={
                            product.productId ||
                            product.id ||
                            index
                          }
                          className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-4 last:border-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {product.name ||
                                product.productName ||
                                "Producto"}
                            </p>

                            <p className="text-xs text-zinc-500">
                              {formatNumber(
                                product.quantity ||
                                  0,
                              )}{" "}
                              unidades
                            </p>
                          </div>

                          <strong className="whitespace-nowrap text-white">
                            {formatCurrency(
                              product.sales,
                            )}
                          </strong>
                        </div>
                      ),
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            CATEGORÍAS
        ====================================================== */}

        {activeAnalysis === "categories" && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white">
                Rendimiento por categoría
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Comparación de unidades y facturación
              </p>
            </div>

            <div className="space-y-6">
              {salesByCategory.length === 0 ? (
                <p className="py-12 text-center text-sm text-zinc-600">
                  No hay datos de categorías.
                </p>
              ) : (
                salesByCategory.map(
                  (
                    category,
                    index,
                  ) => {
                    const percentage =
                      (Number(
                        category.sales || 0,
                      ) /
                        maxCategorySales) *
                      100;

                    return (
                      <div
                        key={
                          category.categoryId ||
                          index
                        }
                      >
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-white">
                              {category.categoryName ||
                                category.category ||
                                "Sin categoría"}
                            </p>

                            <p className="text-xs text-zinc-500">
                              {formatNumber(
                                category.quantity,
                              )}{" "}
                              unidades
                            </p>
                          </div>

                          <strong className="text-white">
                            {formatCurrency(
                              category.sales,
                            )}
                          </strong>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
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
                )
              )}
            </div>
          </div>
        )}

        {/* ======================================================
            PAGOS
        ====================================================== */}

        {activeAnalysis === "payments" && (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Pagados",
                  value:
                    paidPayment?.count || 0,
                  amount:
                    paidPayment?.amount || 0,
                },
                {
                  title: "Pendientes",
                  value:
                    pendingPayment?.count || 0,
                  amount:
                    pendingPayment?.amount || 0,
                },
                {
                  title: "Fallidos",
                  value:
                    failedPayment?.count || 0,
                  amount:
                    failedPayment?.amount || 0,
                },
                {
                  title: "Reembolsados",
                  value:
                    refundedPayment?.count || 0,
                  amount:
                    refundedPayment?.amount || 0,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                >
                  <p className="text-sm text-zinc-500">
                    {item.title}
                  </p>

                  <p className="mt-3 text-3xl font-black text-white">
                    {formatNumber(
                      item.value,
                    )}
                  </p>

                  <p className="mt-2 text-xs text-zinc-600">
                    {formatCurrency(
                      item.amount,
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-bold text-white">
                Distribución de pagos
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Situación de las operaciones
              </p>

              <div className="mt-8 space-y-5">
                {paymentStats.map(
                  (
                    payment,
                    index,
                  ) => {
                    const percentage =
                      totalPaymentCount > 0
                        ? (Number(
                            payment.count || 0,
                          ) /
                            totalPaymentCount) *
                          100
                        : 0;

                    return (
                      <div
                        key={
                          payment.status ||
                          index
                        }
                      >
                        <div className="mb-2 flex justify-between gap-4">
                          <span className="text-sm text-zinc-400">
                            {payment.label ||
                              payment.status}
                          </span>

                          <span className="text-sm font-bold text-white">
                            {formatNumber(
                              payment.count,
                            )}{" "}
                            (
                            {percentage.toFixed(
                              1,
                            )}
                            %)
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            CANCELADOS
        ====================================================== */}

        {activeAnalysis === "cancelled" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                  <XCircle size={27} />
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Pedidos cancelados
                  </p>

                  <p className="text-4xl font-black text-white">
                    {formatNumber(
                      overview.cancelledOrders,
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-bold text-white">
                Impacto de cancelaciones
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <div>
                  <p className="text-sm text-zinc-500">
                    Pedidos totales
                  </p>

                  <p className="mt-2 text-2xl font-black text-white">
                    {formatNumber(
                      overview.totalOrders,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Cancelados
                  </p>

                  <p className="mt-2 text-2xl font-black text-red-400">
                    {formatNumber(
                      overview.cancelledOrders,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Tasa de cancelación
                  </p>

                  <p className="mt-2 text-2xl font-black text-white">
                    {cancellationRate.toFixed(
                      1,
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            STOCK
        ====================================================== */}

        {activeAnalysis === "stock" && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white">
                Productos con stock bajo
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Productos que requieren reposición
              </p>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center text-green-500">
                No hay productos con stock bajo.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {lowStockProducts
                  .slice(0, 20)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-white">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            Stock actual
                          </p>
                        </div>

                        <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-sm font-bold text-yellow-400">
                          {product.stock}
                        </span>
                      </div>

                      {product.category && (
                        <p className="mt-4 text-xs text-zinc-600">
                          Categoría:{" "}
                          {product.category.name}
                        </p>
                      )}

                      {product.brand && (
                        <p className="mt-1 text-xs text-zinc-600">
                          Marca:{" "}
                          {product.brand.name}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /*
   * ============================================================
   * DASHBOARD PRINCIPAL
   * ============================================================
   */

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

        <p className="mt-2 text-sm text-zinc-500">
          Panel general de rendimiento del negocio
        </p>
      </div>

      {/* ======================================================
          FILTROS
      ====================================================== */}

      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
            <CalendarDays size={17} />

            Período
          </div>

          <select
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value)
            }
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 outline-none transition focus:border-red-500/50"
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

            <option value="custom">
              Período personalizado
            </option>
          </select>

          {period === "custom" && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) =>
                  setCustomStartDate(
                    e.target.value,
                  )
                }
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-red-500/50"
              />

              <input
                type="date"
                value={customEndDate}
                min={
                  customStartDate ||
                  undefined
                }
                onChange={(e) =>
                  setCustomEndDate(
                    e.target.value,
                  )
                }
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-red-500/50"
              />
            </>
          )}
        </div>

        {dateRange.startDate &&
          dateRange.endDate && (
            <p className="mt-3 text-xs text-zinc-600">
              Datos desde{" "}
              <span className="text-zinc-400">
                {dateRange.startDate}
              </span>{" "}
              hasta{" "}
              <span className="text-zinc-400">
                {dateRange.endDate}
              </span>
            </p>
          )}
      </div>

      {/* ======================================================
          KPIs
      ====================================================== */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
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
            title: "Pedidos cancelados",
            value: formatNumber(
              overview.cancelledOrders,
            ),
            icon: ShoppingCart,
            iconStyle:
              "bg-red-500/10 text-red-400",
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

      {/* ======================================================
          PRIMERA FILA
      ====================================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* VENTAS */}

        <button
          type="button"
          onClick={() =>
            openAnalysis("sales")
          }
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left transition hover:border-red-500/40 hover:bg-zinc-900/80"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Ventas
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Rendimiento del período
              </p>
            </div>

            <BarChart3
              size={19}
              className="text-red-500"
            />
          </div>

          {salesByPeriod.length === 0 ? (
            <div className="flex h-52 items-center justify-center text-sm text-zinc-600">
              No hay ventas registradas.
            </div>
          ) : (
            <div className="flex h-52 items-end justify-between gap-2 overflow-hidden border-b border-zinc-800 px-2 pb-2">
              {salesByPeriod
                .slice(0, 31)
                .map(
                  (item, index) => {
                    const value = Number(
                      item.total ??
                        item.sales ??
                        0,
                    );

                    const height =
                      (value /
                        maxSalesValue) *
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
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500">
              Ver análisis completo
            </span>

            <span className="text-red-500">
              →
            </span>
          </div>
        </button>

        {/* CATEGORÍAS */}

        <button
          type="button"
          onClick={() =>
            openAnalysis("categories")
          }
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left transition hover:border-red-500/40 hover:bg-zinc-900/80"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Ventas por categoría
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Distribución de ventas
              </p>
            </div>

            <BarChart3
              size={19}
              className="text-red-500"
            />
          </div>

          {salesByCategory.length === 0 ? (
            <div className="flex h-52 items-center justify-center text-sm text-zinc-600">
              No hay ventas por categoría.
            </div>
          ) : (
            <div className="space-y-4">
              {salesByCategory
                .slice(0, 4)
                .map(
                  (
                    category,
                    index,
                  ) => {
                    const percentage =
                      (Number(
                        category.sales ||
                          0,
                      ) /
                        maxCategorySales) *
                      100;

                    return (
                      <div
                        key={
                          category.categoryId ||
                          index
                        }
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="truncate text-sm text-zinc-400">
                            {category.categoryName ||
                              category.category ||
                              "Sin categoría"}
                          </span>

                          <strong className="text-sm text-white">
                            {formatCurrency(
                              category.sales,
                            )}
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

          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500">
              Ver análisis completo
            </span>

            <span className="text-red-500">
              →
            </span>
          </div>
        </button>

        {/* PEDIDOS */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Pedidos recientes
            </h2>

            <Link
              to="/admin/orders"
              className="text-sm font-semibold text-red-500 hover:text-red-400"
            >
              Ver todos
            </Link>
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

      {/* ======================================================
          SEGUNDA FILA
      ====================================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* PRODUCTOS */}

        <button
          type="button"
          onClick={() =>
            openAnalysis("products")
          }
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left transition hover:border-red-500/40 hover:bg-zinc-900/80"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Productos más vendidos
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Mayor cantidad de ventas
              </p>
            </div>

            <Package
              size={19}
              className="text-red-500"
            />
          </div>

          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-600">
                No hay ventas de productos.
              </p>
            ) : (
              topProducts
                .slice(0, 5)
                .map(
                  (
                    product,
                    index,
                  ) => (
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
                          {product.name ||
                            product.productName ||
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
                  ),
                )
            )}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500">
              Ver análisis completo
            </span>

            <span className="text-red-500">
              →
            </span>
          </div>
        </button>

        {/* PAGOS */}

        <button
          type="button"
          onClick={() =>
            openAnalysis("payments")
          }
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left transition hover:border-red-500/40 hover:bg-zinc-900/80"
        >
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
                (
                  payment,
                  index,
                ) => (
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

          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500">
              Ver análisis completo
            </span>

            <span className="text-red-500">
              →
            </span>
          </div>
        </button>

        {/* STOCK */}

        <button
          type="button"
          onClick={() =>
            openAnalysis("stock")
          }
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left transition hover:border-red-500/40 hover:bg-zinc-900/80"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
              <AlertTriangle size={19} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Stock bajo
              </h2>

              <p className="text-sm text-zinc-500">
                Requieren reposición
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {lowStockProducts.length === 0 ? (
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

          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500">
              Ver análisis completo
            </span>

            <span className="text-red-500">
              →
            </span>
          </div>
        </button>
      </div>

      {/* ======================================================
          CANCELADOS
      ====================================================== */}

      <button
        type="button"
        onClick={() =>
          openAnalysis("cancelled")
        }
        className="mt-6 w-full rounded-2xl border border-red-500/10 bg-red-500/5 p-6 text-left transition hover:border-red-500/30 hover:bg-red-500/10"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <ShoppingCart size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Pedidos cancelados
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Analizar cancelaciones del período
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-2xl font-black text-red-400">
              {formatNumber(
                overview.cancelledOrders,
              )}
            </span>

            <span className="text-red-500">
              →
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}