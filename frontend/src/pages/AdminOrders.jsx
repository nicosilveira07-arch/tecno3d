import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "@/services/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders");

      setOrders(response.data.data || []);
    } catch (error) {
      console.error(
        "ERROR CARGANDO PEDIDOS ADMIN:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudieron cargar los pedidos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "PENDING":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

      case "CONFIRMED":
        return "border-green-500/30 bg-green-500/10 text-green-400";

      case "PROCESSING":
        return "border-blue-500/30 bg-blue-500/10 text-blue-400";

      case "SHIPPED":
        return "border-purple-500/30 bg-purple-500/10 text-purple-400";

      case "DELIVERED":
        return "border-green-500/30 bg-green-500/10 text-green-400";

      case "CANCELLED":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      default:
        return "border-zinc-700 bg-zinc-800 text-zinc-400";
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Fecha no disponible";
    }

    return new Date(date).toLocaleString("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const orderId = String(order.id || "").toLowerCase();

      const matchesProductId = order.items?.some((item) =>
        String(item.productId || "").toLowerCase().includes(
          normalizedSearch
        )
      );

      const paymentTransactionId = String(
        order.payment?.transactionId || ""
      ).toLowerCase();

      const matchesPaymentId =
        paymentTransactionId.includes(normalizedSearch);

      const matchesOrderId =
        orderId.includes(normalizedSearch);

      const matchesSearch =
        !normalizedSearch ||
        matchesOrderId ||
        matchesProductId ||
        matchesPaymentId;

      const matchesStatus =
        statusFilter === "ALL" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  const hasActiveFilters =
    search.trim() !== "" || statusFilter !== "ALL";

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
        <p className="text-zinc-400">
          Cargando pedidos...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ENCABEZADO */}

      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-red-500">
          Administración
        </p>

        <h1 className="text-3xl font-black text-white md:text-4xl">
          Pedidos
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Gestioná todos los pedidos realizados en la tienda.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* FILTROS */}

      {!error && orders.length > 0 && (
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
            {/* BUSCAR */}

            <div>
              <label
                htmlFor="order-search"
                className="mb-2 block text-sm font-semibold text-zinc-400"
              >
                Buscar pedido
              </label>

              <input
                id="order-search"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="ID pedido, ID producto o ID pago Mercado Pago..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
              />
            </div>

            {/* ESTADO */}

            <div>
              <label
                htmlFor="order-status"
                className="mb-2 block text-sm font-semibold text-zinc-400"
              >
                Estado
              </label>

              <select
                id="order-status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-red-500"
              >
                <option value="ALL">
                  Todos los estados
                </option>

                <option value="PENDING">
                  Pendiente
                </option>

                <option value="CONFIRMED">
                  Confirmado
                </option>

                <option value="PROCESSING">
                  Preparando
                </option>

                <option value="SHIPPED">
                  Enviado
                </option>

                <option value="DELIVERED">
                  Entregado
                </option>

                <option value="CANCELLED">
                  Cancelado
                </option>
              </select>
            </div>

            {/* LIMPIAR */}

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          {/* RESULTADOS */}

          <div className="mt-4 border-t border-zinc-800 pt-4">
            <p className="text-sm text-zinc-500">
              Mostrando{" "}
              <span className="font-semibold text-zinc-300">
                {filteredOrders.length}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-zinc-300">
                {orders.length}
              </span>{" "}
              pedidos
            </p>
          </div>
        </div>
      )}

      {/* SIN PEDIDOS */}

      {!error && orders.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-zinc-400">
            Todavía no hay pedidos registrados.
          </p>
        </div>
      )}

      {/* SIN RESULTADOS */}

      {!error &&
        orders.length > 0 &&
        filteredOrders.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-zinc-300">
              No se encontraron pedidos.
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Probá con un ID de pedido, ID de producto o ID de pago de Mercado Pago.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-bold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              Limpiar filtros
            </button>
          </div>
        )}

      {/* PEDIDOS */}

      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            {/* CABECERA */}

            <div className="mb-6 grid gap-6 md:grid-cols-4">
              {/* PEDIDO */}

              <div>
                <p className="text-sm text-zinc-500">
                  Pedido
                </p>

                <p className="mt-1 break-all font-semibold text-white">
                  #{order.id}
                </p>

                <p className="mt-2 text-xs text-zinc-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              {/* CLIENTE */}

              <div>
                <p className="text-sm text-zinc-500">
                  Cliente
                </p>

                <p className="mt-1 font-semibold text-white">
                  {order.user?.firstName}{" "}
                  {order.user?.lastName}
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  {order.user?.email}
                </p>
              </div>

              {/* ESTADO */}

              <div>
                <p className="text-sm text-zinc-500">
                  Estado
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-bold ${getStatusStyle(
                    order.status
                  )}`}
                >
                  {{
                    PENDING: "Pendiente",
                    CONFIRMED: "Confirmado",
                    PROCESSING: "Preparando",
                    SHIPPED: "Enviado",
                    DELIVERED: "Entregado",
                    CANCELLED: "Cancelado",
                  }[order.status] || order.status}
                </span>
              </div>

              {/* TOTAL */}

              <div>
                <p className="text-sm text-zinc-500">
                  Total
                </p>

                <p className="mt-1 text-xl font-black text-white">
                  UYU{" "}
                  {Number(order.total).toFixed(2)}
                </p>
              </div>
            </div>

            {/* PRODUCTOS */}

            <div className="border-t border-zinc-800 pt-5">
              <p className="mb-4 text-sm font-semibold text-zinc-400">
                Productos
              </p>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-zinc-950 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">
                          {item.product?.name ||
                            item.productName ||
                            "Producto no disponible"}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          Cantidad: {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 font-semibold text-white">
                        UYU{" "}
                        {(
                          Number(item.price) *
                          item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>

                    {/* ID PRODUCTO */}

                    {item.productId && (
                      <p className="mt-2 break-all text-xs text-zinc-600">
                        ID producto: {item.productId}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* PAGO MERCADO PAGO */}

            {order.payment?.transactionId && (
              <div className="mt-5 border-t border-zinc-800 pt-5">
                <p className="text-sm text-zinc-500">
                  ID pago Mercado Pago
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-zinc-300">
                  {order.payment.transactionId}
                </p>
              </div>
            )}

            {/* ACCIONES */}

            <div className="mt-6 flex justify-end border-t border-zinc-800 pt-5">
              <Link
                to={`/admin/orders/${order.id}`}
                className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-bold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                Ver pedido
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}