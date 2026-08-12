import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "@/services/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      {/* SIN PEDIDOS */}

      {!error && orders.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-zinc-400">
            Todavía no hay pedidos registrados.
          </p>
        </div>
      )}

      {/* PEDIDOS */}

      <div className="space-y-6">

        {orders.map((order) => (

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

                <p className="mt-1 font-semibold text-white">
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
                    className="flex items-center justify-between rounded-xl bg-zinc-950 p-4"
                  >

                    <div>

                      <p className="font-semibold text-white">
                        {item.product?.name}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Cantidad: {item.quantity}
                      </p>

                    </div>

                    <p className="font-semibold text-white">
                      UYU{" "}
                      {(
                        Number(item.price) *
                        item.quantity
                      ).toFixed(2)}
                    </p>

                  </div>

                ))}

              </div>

            </div>

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