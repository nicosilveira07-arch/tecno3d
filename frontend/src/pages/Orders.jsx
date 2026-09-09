import { useEffect, useState } from "react";

import api from "@/services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pendingCheckouts, setPendingCheckouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const [
          ordersResponse,
          pendingResponse,
        ] = await Promise.all([
          api.get("/orders/my-orders"),
          api.get("/checkout-sessions/my-pending"),
        ]);

        const ordersData =
          Array.isArray(ordersResponse.data.data)
            ? ordersResponse.data.data
            : [];

        // La nueva arquitectura ya no utiliza
        // Orders con estado PENDING.
        //
        // Solo mostramos pedidos reales.
        const realOrders =
          ordersData.filter((order) =>
            [
              "CONFIRMED",
              "PROCESSING",
              "SHIPPED",
              "DELIVERED",
              "CANCELLED",
            ].includes(order.status)
          );

        const pendingData =
          Array.isArray(pendingResponse.data.data)
            ? pendingResponse.data.data
            : [];

        setOrders(realOrders);
        setPendingCheckouts(pendingData);
      } catch (error) {
        console.error(
          "ERROR CARGANDO PEDIDOS:",
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

    loadOrders();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500/10 text-green-400 border-green-500/30";

      case "PROCESSING":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";

      case "SHIPPED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";

      case "DELIVERED":
        return "bg-green-500/10 text-green-400 border-green-500/30";

      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border-red-500/30";

      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmado";

      case "PROCESSING":
        return "Preparando";

      case "SHIPPED":
        return "Enviado";

      case "DELIVERED":
        return "Entregado";

      case "CANCELLED":
        return "Cancelado";

      default:
        return status;
    }
  };

  const getCheckoutStatusStyle = (status) => {
    if (status === "PAYMENT_PENDING") {
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    }

    if (status === "EXPIRED") {
      return "bg-red-500/10 text-red-400 border-red-500/30";
    }

    return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
  };

  const getCheckoutStatusLabel = (status) => {
    if (status === "PAYMENT_PENDING") {
      return "Pago pendiente";
    }

    if (status === "EXPIRED") {
      return "Cancelado por vencimiento";
    }

    return status;
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
      <section className="min-h-screen bg-black px-6 py-12">
        <div className="mx-auto max-w-6xl text-center text-zinc-400">
          Cargando pedidos...
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-black px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-10 text-4xl font-black text-white">
          Mis pedidos
        </h1>

        {error && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* ======================================================
            COMPRAS EN TRÁMITE
        ====================================================== */}

        {pendingCheckouts.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-5 text-2xl font-black text-white">
              Compras en trámite
            </h2>

            <div className="space-y-6">
              {pendingCheckouts.map((checkout) => (
                <div
                  key={checkout.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                >
                  {/* CABECERA */}

                  <div className="mb-6 grid gap-6 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-zinc-500">
                        Referencia
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        #{checkout.id}
                      </p>

                      <p className="mt-2 text-sm text-zinc-500">
                        {formatDate(
                          checkout.createdAt
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-500">
                        Estado
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-bold ${getCheckoutStatusStyle(
                          checkout.status
                        )}`}
                      >
                        {getCheckoutStatusLabel(
                          checkout.status
                        )}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-500">
                        Total
                      </p>

                      <p className="mt-1 text-xl font-black text-white">
                        UYU{" "}
                        {Number(
                          checkout.total
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* INFORMACIÓN DEL PAGO */}

                  <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                    <h2 className="mb-4 font-bold text-white">
                      Información del pago
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {checkout.paymentMethod && (
                        <div>
                          <p className="text-sm text-zinc-500">
                            Método de pago
                          </p>

                          <p className="mt-1 font-semibold text-white">
                            {checkout.paymentMethod ===
                            "MERCADO_PAGO"
                              ? "Mercado Pago"
                              : checkout.paymentMethod}
                          </p>
                        </div>
                      )}

                      {checkout.paymentReferenceId && (
                        <div>
                          <p className="text-sm text-zinc-500">
                            Código de pago
                          </p>

                          <p className="mt-1 font-mono font-bold text-yellow-400">
                            {
                              checkout.paymentReferenceId
                            }
                          </p>
                        </div>
                      )}

                      {checkout.paymentVerificationCode &&
                        checkout.paymentVerificationCode !==
                          checkout.paymentReferenceId && (
                          <div>
                            <p className="text-sm text-zinc-500">
                              Código de verificación
                            </p>

                            <p className="mt-1 font-mono font-bold text-yellow-400">
                              {
                                checkout.paymentVerificationCode
                              }
                            </p>
                          </div>
                        )}
                    </div>

                    {checkout.status ===
                      "PAYMENT_PENDING" && (
                      <p className="mt-4 text-sm text-zinc-400">
                        El pago todavía no fue confirmado.
                        Una vez aprobado, esta compra se
                        convertirá automáticamente en un
                        pedido confirmado.
                      </p>
                    )}

                    {checkout.status === "EXPIRED" && (
                      <p className="mt-4 text-sm text-red-400">
                        El plazo para completar el pago
                        venció. Esta compra fue cancelada y
                        no generó un pedido.
                      </p>
                    )}

                    {checkout.paymentInstructionsUrl &&
                      checkout.status ===
                        "PAYMENT_PENDING" && (
                        <a
                          href={
                            checkout.paymentInstructionsUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex rounded-xl bg-yellow-500 px-5 py-3 font-bold text-black transition hover:bg-yellow-400"
                        >
                          Ver instrucciones de pago
                        </a>
                      )}
                  </div>

                  {/* PRODUCTOS */}

                  {Array.isArray(
                    checkout.items
                  ) &&
                    checkout.items.length > 0 && (
                      <div className="space-y-4">
                        <h2 className="font-bold text-white">
                          Productos
                        </h2>

                        {checkout.items.map(
                          (item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between border-t border-zinc-800 pt-4"
                            >
                              <div>
                                <p className="font-semibold text-white">
                                  {item.product?.name ||
                                    item.productName ||
                                    "Producto no disponible"}
                                </p>

                                <p className="text-sm text-zinc-500">
                                  Cantidad:{" "}
                                  {item.quantity}
                                </p>
                              </div>

                              <p className="font-semibold text-white">
                                UYU{" "}
                                {(
                                  Number(
                                    item.price
                                  ) *
                                  item.quantity
                                ).toFixed(2)}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================
            PEDIDOS REALES
        ====================================================== */}

        {!error &&
          orders.length === 0 &&
          pendingCheckouts.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
              <p className="text-zinc-400">
                Todavía no tenés pedidos.
              </p>
            </div>
          )}

        {orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
              >
                {/* CABECERA */}

                <div className="mb-6 grid gap-6 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-zinc-500">
                      Pedido
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      #{order.id}
                    </p>

                    <p className="mt-2 text-sm text-zinc-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">
                      Estado
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-bold ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(
                        order.status
                      )}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">
                      Total
                    </p>

                    <p className="mt-1 text-xl font-black text-white">
                      UYU{" "}
                      {Number(
                        order.total
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* INFORMACIÓN DE ENVÍO */}

                {order.deliveryMethod ===
                  "SHIPPING" &&
                  (order.shippingCompany ||
                    order.trackingNumber) && (
                    <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                      <h2 className="mb-4 font-bold text-white">
                        Información de envío
                      </h2>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {order.shippingCompany && (
                          <div>
                            <p className="text-sm text-zinc-500">
                              Empresa de envío
                            </p>

                            <p className="mt-1 font-semibold text-white">
                              {
                                order.shippingCompany
                              }
                            </p>
                          </div>
                        )}

                        {order.trackingNumber && (
                          <div>
                            <p className="text-sm text-zinc-500">
                              Número de rastreo
                            </p>

                            <p className="mt-1 font-mono font-bold text-red-500">
                              {
                                order.trackingNumber
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* RETIRO EN LOCAL */}

                {order.deliveryMethod ===
                  "PICKUP" && (
                    <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                      <h2 className="font-bold text-white">
                        Retiro en local
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        Este pedido será retirado
                        en el local.
                      </p>
                    </div>
                  )}

                {/* PRODUCTOS */}

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-t border-zinc-800 pt-4"
                    >
                      <div>
                        <p className="font-semibold text-white">
                          {item.product?.name ||
                            item.productName ||
                            "Producto no disponible"}
                        </p>

                        <p className="text-sm text-zinc-500">
                          Cantidad:{" "}
                          {item.quantity}
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

