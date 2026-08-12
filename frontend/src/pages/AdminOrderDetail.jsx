import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import api from "@/services/api";

export default function AdminOrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");

  const [shippingCompany, setShippingCompany] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/orders/${id}`);

      const loadedOrder = response.data.data;

      setOrder(loadedOrder);

      setShippingCompany(
        loadedOrder.shippingCompany || ""
      );

      setTrackingNumber(
        loadedOrder.trackingNumber || ""
      );
    } catch (error) {
      console.error(
        "ERROR CARGANDO PEDIDO:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo cargar el pedido."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const formatDate = (date) => {
    if (!date) {
      return "Fecha no disponible";
    }

    return new Date(date).toLocaleString(
      "es-UY",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // TRADUCIR ESTADO PARA MOSTRAR AL USUARIO

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "PENDIENTE";

      case "CONFIRMED":
        return "CONFIRMADO";

      case "PROCESSING":
        return "EN PREPARACIÓN";

      case "SHIPPED":
        return "ENVIADO";

      case "DELIVERED":
        return "ENTREGADO";

      case "CANCELLED":
        return "CANCELADO";

      default:
        return status;
    }
  };

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

  // TRADUCIR ESTADO DEL PAGO

  const getPaymentLabel = (status) => {
    switch (status) {
      case "PAID":
        return "PAGADO";

      case "PENDING":
        return "PENDIENTE";

      case "FAILED":
        return "RECHAZADO";

      case "REFUNDED":
        return "REEMBOLSADO";

      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "MERCADO_PAGO":
        return "Mercado Pago";

      case "PAYPAL":
        return "PayPal";

      case "CASH":
        return "Efectivo";

      case "BANK_TRANSFER":
        return "Transferencia bancaria";

      default:
        return method;
    }
  };

  const getPaymentStyle = (status) => {
    switch (status) {
      case "PAID":
        return "border-green-500/30 bg-green-500/10 text-green-400";

      case "PENDING":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

      case "FAILED":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      case "REFUNDED":
        return "border-purple-500/30 bg-purple-500/10 text-purple-400";

      default:
        return "border-zinc-700 bg-zinc-800 text-zinc-400";
    }
  };

  const handlePrepareOrder = async () => {
    try {
      setUpdatingStatus(true);
      setError("");

      const response = await api.patch(
        `/orders/${id}/status`,
        {
          status: "PROCESSING",
        }
      );

      setOrder(response.data.data);
    } catch (error) {
      console.error(
        "ERROR PREPARANDO PEDIDO:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo preparar el pedido."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleShipOrder = async () => {
    const company = String(
      shippingCompany
    ).trim();

    const tracking = String(
      trackingNumber
    ).trim();

    if (!company) {
      setError(
        "Debes ingresar la empresa de envío."
      );
      return;
    }

    if (!tracking) {
      setError(
        "Debes ingresar el número de rastreo."
      );
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");

      const response = await api.patch(
        `/orders/${id}/status`,
        {
          status: "SHIPPED",
          shippingCompany: company,
          trackingNumber: tracking,
        }
      );

      setOrder(response.data.data);
    } catch (error) {
      console.error(
        "ERROR ENVIANDO PEDIDO:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo enviar el pedido."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-white">
        Cargando pedido...
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="p-8">
        <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-400">
          {error}
        </div>

        <Link
          to="/admin/orders"
          className="inline-flex rounded-xl border border-zinc-700 px-5 py-3 font-bold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
        >
          Volver a pedidos
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-white">
        Pedido no encontrado.
      </div>
    );
  }

  return (
    <div>
      {/* ENCABEZADO */}

      <div className="mb-8">
        <Link
          to="/admin/orders"
          className="text-sm font-semibold text-zinc-500 transition hover:text-white"
        >
          ← Volver a pedidos
        </Link>

        <p className="mt-6 mb-2 text-sm font-semibold text-red-500">
          Administración
        </p>

        <h1 className="text-3xl font-black text-white md:text-4xl">
          Pedido #{order.id}
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          {formatDate(order.createdAt)}
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* INFORMACIÓN GENERAL */}

      <div className="grid gap-6 md:grid-cols-5">

        {/* CLIENTE */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="mb-4 text-sm font-semibold text-zinc-500">
            Cliente
          </p>

          <p className="font-bold text-white">
            {order.user?.firstName}{" "}
            {order.user?.lastName}
          </p>

          <p className="mt-2 break-all text-sm text-zinc-400">
            {order.user?.email}
          </p>

          <p className="mt-3 text-xs text-zinc-600">
            ID cliente
          </p>

          <p className="mt-1 break-all text-xs text-zinc-400">
            {order.userId}
          </p>
        </div>

        {/* ESTADO */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="mb-4 text-sm font-semibold text-zinc-500">
            Estado del pedido
          </p>

          <span
            className={`inline-flex rounded-full border px-4 py-2 text-sm font-bold ${getStatusStyle(
              order.status
            )}`}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>

        {/* PAGO */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="mb-4 text-sm font-semibold text-zinc-500">
            Pago
          </p>

          {order.payment ? (
            <>
              <span
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-bold ${getPaymentStyle(
                  order.payment.status
                )}`}
              >
                {getPaymentLabel(
                  order.payment.status
                )}
              </span>

              <p className="mt-3 text-sm text-zinc-400">
                Método:{" "}
                <span className="text-zinc-200">
                  {getPaymentMethodLabel(
                    order.payment.method
                  )}
                </span>
              </p>

              {order.payment.transactionId && (
                <p className="mt-2 break-all text-xs text-zinc-500">
                  Transacción:{" "}
                  {order.payment.transactionId}
                </p>
              )}
            </>
          ) : (
            <p className="text-zinc-500">
              Sin pago registrado
            </p>
          )}
        </div>

        {/* ENTREGA */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="mb-4 text-sm font-semibold text-zinc-500">
            Entrega
          </p>

          <p className="font-bold text-white">
            {order.deliveryMethod === "SHIPPING"
              ? "Envío"
              : "Retiro en local"}
          </p>
        </div>

        {/* TOTAL */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="mb-4 text-sm font-semibold text-zinc-500">
            Total
          </p>

          <p className="text-2xl font-black text-white">
            UYU {Number(order.total).toFixed(2)}
          </p>
        </div>

      </div>

      {/* PREPARAR PEDIDO */}

      {order.status === "CONFIRMED" && (
        <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">

          <p className="text-lg font-black text-white">
            Pedido listo para preparar
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            El pago está confirmado. Podés comenzar
            a preparar el paquete.
          </p>

          <button
            type="button"
            onClick={handlePrepareOrder}
            disabled={
              updatingStatus ||
              order.payment?.status !== "PAID"
            }
            className="mt-5 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
          >
            {updatingStatus
              ? "Preparando..."
              : "Preparar pedido"}
          </button>

          {order.payment?.status !== "PAID" && (
            <p className="mt-3 text-sm text-yellow-500">
              El pedido no puede prepararse hasta que
              el pago esté confirmado.
            </p>
          )}

        </div>
      )}

      {/* ENVIAR PEDIDO */}

      {order.status === "PROCESSING" && (
        <div className="mt-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">

          <p className="text-lg font-black text-white">
            Pedido preparado
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            El paquete está preparado. Ingresá la
            empresa de envío y el número de rastreo
            para marcarlo como enviado.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-400">
                Empresa de envío
              </label>

              <input
                type="text"
                value={shippingCompany}
                onChange={(event) =>
                  setShippingCompany(
                    String(event.target.value)
                  )
                }
                placeholder="Ej: DAC, UES, Mirtrans..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-400">
                Número de rastreo
              </label>

              <input
                type="text"
                value={trackingNumber}
                onChange={(event) =>
                  setTrackingNumber(
                    String(event.target.value)
                  )
                }
                placeholder="Ej: 171981981051"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-500"
              />
            </div>

          </div>

          <button
            type="button"
            onClick={handleShipOrder}
            disabled={updatingStatus}
            className="mt-5 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
          >
            {updatingStatus
              ? "Enviando..."
              : "Marcar como enviado"}
          </button>

        </div>
      )}

      {/* INFORMACIÓN DEL ENVÍO */}

      {order.status === "SHIPPED" && (
        <div className="mt-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">

          <p className="text-lg font-black text-white">
            Pedido enviado
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            El cliente ya puede consultar la
            información del envío.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            <div className="rounded-xl bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">
                Empresa de envío
              </p>

              <p className="mt-1 font-bold text-white">
                {order.shippingCompany ||
                  "No informado"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">
                Número de rastreo
              </p>

              <p className="mt-1 break-all font-bold text-white">
                {order.trackingNumber ||
                  "No informado"}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* PRODUCTOS */}

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

        <h2 className="mb-5 text-xl font-black text-white">
          Productos
        </h2>

        <div className="space-y-3">

          {order.items?.map((item) => (
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

              <p className="font-bold text-white">
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

      {/* INFORMACIÓN DE ENTREGA */}

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

        <h2 className="mb-5 text-xl font-black text-white">
          Información de entrega
        </h2>

        <p className="text-sm text-zinc-500">
          Método de entrega
        </p>

        <p className="mt-1 font-semibold text-white">
          {order.deliveryMethod === "SHIPPING"
            ? "Envío"
            : "Retiro en local"}
        </p>

        {order.address && (
          <div className="mt-5 border-t border-zinc-800 pt-5">

            <p className="text-sm text-zinc-500">
              Dirección
            </p>

            <p className="mt-1 text-zinc-300">
              {order.address.street}{" "}
              {order.address.number}
            </p>

            <p className="mt-1 text-zinc-400">
              {order.address.city},{" "}
              {order.address.state}
            </p>

            <p className="mt-1 text-zinc-400">
              {order.address.country}
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              CP: {order.address.zipCode}
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

