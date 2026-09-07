import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "@/services/api";

import {
  addToCart,
  clearCart,
} from "@/features/cart/cart.store";

import { cancelPendingOrder } from "@/services/orders.api";

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [continuingOrderId, setContinuingOrderId] =
    useState(null);
  const [cancellingOrderId, setCancellingOrderId] =
    useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response =
          await api.get("/orders/my-orders");

        setOrders(response.data.data);
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

      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";

      case "FAILED":
      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border-red-500/30";

      case "PROCESSING":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";

      case "SHIPPED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";

      case "DELIVERED":
        return "bg-green-500/10 text-green-400 border-green-500/30";

      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";

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

  const handleContinueOrder = async (order) => {
    if (
      !order ||
      order.status !== "PENDING"
    ) {
      return;
    }

    try {
      setContinuingOrderId(order.id);
      setError("");

      const response =
        await api.get(`/orders/pending/${order.id}`);

      const pendingOrder =
        response.data.data;

      if (
        !pendingOrder ||
        pendingOrder.id !== order.id ||
        pendingOrder.status !== "PENDING"
      ) {
        throw new Error(
          "El pedido pendiente ya no está disponible."
        );
      }

      if (
        pendingOrder.payment &&
        pendingOrder.payment.status === "PAID"
      ) {
        throw new Error(
          "Este pedido ya tiene el pago confirmado."
        );
      }

      if (
        !Array.isArray(pendingOrder.items) ||
        pendingOrder.items.length === 0
      ) {
        throw new Error(
          "El pedido pendiente no contiene productos."
        );
      }

      clearCart();

      for (const item of pendingOrder.items) {
        const product = item.product;

        if (!product) {
          console.warn(
            "PRODUCTO NO DISPONIBLE:",
            item.productId
          );

          continue;
        }

        for (
          let quantity = 0;
          quantity < item.quantity;
          quantity++
        ) {
          addToCart({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            offerActive:
              product.offerActive,
            offerPrice:
              product.offerPrice,
            image: product.image,
          });
        }
      }

      navigate("/checkout", {
        state: {
          pendingOrderId:
            pendingOrder.id,

          deliveryMethod:
            pendingOrder.deliveryMethod,

          addressId:
            pendingOrder.addressId,
        },
      });
    } catch (error) {
      console.error(
        "ERROR CONTINUANDO PEDIDO:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "No se pudo continuar la compra."
      );

      setContinuingOrderId(null);
    }
  };

  const handleCancelOrder = async (order) => {
    if (
      !order ||
      order.status !== "PENDING"
    ) {
      return;
    }

    const confirmed = window.confirm(
      "¿Estás seguro de que querés cancelar esta compra?\n\nEl pedido quedará registrado como cancelado y no podrás continuarlo."
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingOrderId(order.id);
      setError("");

      await cancelPendingOrder(order.id);

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                status: "CANCELLED",
              }
            : currentOrder
        )
      );
    } catch (error) {
      console.error(
        "ERROR CANCELANDO PEDIDO:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo cancelar la compra."
      );
    } finally {
      setCancellingOrderId(null);
    }
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

        {!error && orders.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-zinc-400">
              Todavía no tenés pedidos.
            </p>
          </div>
        )}

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
                    {Number(order.total).toFixed(
                      2
                    )}
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

              {/* ACCIONES DE COMPRA PENDIENTE */}

              {order.status === "PENDING" && (
                <div className="mt-6 flex flex-col gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      handleCancelOrder(
                        order
                      )
                    }
                    disabled={
                      cancellingOrderId ===
                        order.id ||
                      continuingOrderId ===
                        order.id
                    }
                    className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-400 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancellingOrderId ===
                    order.id
                      ? "Cancelando..."
                      : "Cancelar compra"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleContinueOrder(
                        order
                      )
                    }
                    disabled={
                      continuingOrderId ===
                        order.id ||
                      cancellingOrderId ===
                        order.id
                    }
                    className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
                  >
                    {continuingOrderId ===
                    order.id
                      ? "Cargando compra..."
                      : "Continuar compra"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

