import { useEffect, useState } from "react";
import {
  Copy,
  Plus,
  Trash2,
  Power,
  Ticket,
} from "lucide-react";

import api from "@/services/api";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    type: "PERCENTAGE",
    value: "",
    maxUses: "",
    expiresAt: "",
  });

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/coupons");

      setCoupons(response.data.data || []);
    } catch (error) {
      console.error(
        "ERROR CARGANDO CUPONES:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudieron cargar los cupones."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateCoupon = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        "/coupons",
        {
          type: form.type,
          value: Number(form.value),
          maxUses:
            form.maxUses === ""
              ? null
              : Number(form.maxUses),
          expiresAt:
            form.expiresAt || null,
        }
      );

      const newCoupon = response.data.data;

      setCoupons((previous) => [
        newCoupon,
        ...previous,
      ]);

      setForm({
        type: "PERCENTAGE",
        value: "",
        maxUses: "",
        expiresAt: "",
      });

      setShowForm(false);

      setSuccess(
        `Cupón ${newCoupon.code} creado correctamente.`
      );
    } catch (error) {
      console.error(
        "ERROR CREANDO CUPÓN:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo crear el cupón."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      setError("");
      setSuccess("");

      const response = await api.put(
        `/coupons/${coupon.id}`,
        {
          active: !coupon.active,
        }
      );

      const updatedCoupon =
        response.data.data;

      setCoupons((previous) =>
        previous.map((item) =>
          item.id === updatedCoupon.id
            ? updatedCoupon
            : item
        )
      );

      setSuccess(
        updatedCoupon.active
          ? "Cupón activado correctamente."
          : "Cupón desactivado correctamente."
      );
    } catch (error) {
      console.error(
        "ERROR ACTUALIZANDO CUPÓN:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo actualizar el cupón."
      );
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    const confirmed = window.confirm(
      `¿Seguro que querés eliminar el cupón ${coupon.code}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/coupons/${coupon.id}`
      );

      setCoupons((previous) =>
        previous.filter(
          (item) => item.id !== coupon.id
        )
      );

      setSuccess(
        "Cupón eliminado correctamente."
      );
    } catch (error) {
      console.error(
        "ERROR ELIMINANDO CUPÓN:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo eliminar el cupón."
      );
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setSuccess(
        `Código ${code} copiado.`
      );
    } catch (error) {
      console.error(
        "ERROR COPIANDO CÓDIGO:",
        error
      );
    }
  };

  const formatDiscount = (coupon) => {
    if (coupon.type === "PERCENTAGE") {
      return `${coupon.value}%`;
    }

    return `UYU ${Number(
      coupon.value
    ).toFixed(2)}`;
  };

  const formatExpiration = (date) => {
    if (!date) {
      return "Sin vencimiento";
    }

    return new Date(date).toLocaleDateString(
      "es-UY"
    );
  };

  return (
    <section>
      {/* HEADER */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <Ticket
              size={30}
              className="text-red-500"
            />

            <h1 className="text-3xl font-black text-white">
              Cupones
            </h1>
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            Creá y administrá los descuentos de
            TECNO3D.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowForm(
              (previous) => !previous
            )
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
        >
          <Plus size={18} />

          Nuevo cupón
        </button>
      </div>

      {/* MENSAJES */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-green-800 bg-green-950/30 p-4 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* FORMULARIO */}

      {showForm && (
        <form
          onSubmit={handleCreateCoupon}
          className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <h2 className="mb-6 text-xl font-bold text-white">
            Crear nuevo cupón
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            {/* TIPO */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-400">
                Tipo de descuento
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
              >
                <option value="PERCENTAGE">
                  Porcentaje
                </option>

                <option value="FIXED">
                  Monto fijo
                </option>
              </select>
            </div>

            {/* VALOR */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-400">
                Valor del descuento
              </label>

              <input
                type="number"
                name="value"
                value={form.value}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
                placeholder={
                  form.type === "PERCENTAGE"
                    ? "Ej: 20"
                    : "Ej: 500"
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
              />
            </div>

            {/* MAX USOS */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-400">
                Máximo de usos
              </label>

              <input
                type="number"
                name="maxUses"
                value={form.maxUses}
                onChange={handleChange}
                min="1"
                step="1"
                placeholder="Ej: 100"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
              />

              <p className="mt-1 text-xs text-zinc-600">
                Dejalo vacío para usos ilimitados.
              </p>
            </div>

            {/* VENCIMIENTO */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-400">
                Fecha de vencimiento
              </label>

              <input
                type="datetime-local"
                name="expiresAt"
                value={form.expiresAt}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
              />

              <p className="mt-1 text-xs text-zinc-600">
                Opcional.
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:bg-zinc-700"
            >
              {saving
                ? "Creando..."
                : "Crear cupón"}
            </button>

            <button
              type="button"
              onClick={() =>
                setShowForm(false)
              }
              className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* LISTADO */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-6">
          <h2 className="text-xl font-bold text-white">
            Cupones existentes
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Administrá los códigos disponibles.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-zinc-500">
            Cargando cupones...
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            Todavía no hay cupones creados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-4">
                    Código
                  </th>

                  <th className="px-6 py-4">
                    Descuento
                  </th>

                  <th className="px-6 py-4">
                    Usos
                  </th>

                  <th className="px-6 py-4">
                    Vencimiento
                  </th>

                  <th className="px-6 py-4">
                    Estado
                  </th>

                  <th className="px-6 py-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="border-b border-zinc-800 last:border-0"
                  >
                    {/* CÓDIGO */}

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-zinc-950 px-3 py-2 font-mono font-bold text-white">
                          {coupon.code}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyCode(
                              coupon.code
                            )
                          }
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                          title="Copiar código"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </td>

                    {/* DESCUENTO */}

                    <td className="px-6 py-5 font-bold text-red-500">
                      {formatDiscount(
                        coupon
                      )}
                    </td>

                    {/* USOS */}

                    <td className="px-6 py-5 text-zinc-300">
                      {coupon.usedCount}

                      {" / "}

                      {coupon.maxUses ??
                        "∞"}
                    </td>

                    {/* VENCIMIENTO */}

                    <td className="px-6 py-5 text-sm text-zinc-400">
                      {formatExpiration(
                        coupon.expiresAt
                      )}
                    </td>

                    {/* ESTADO */}

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          coupon.active
                            ? "bg-green-600/10 text-green-500"
                            : "bg-zinc-700/30 text-zinc-500"
                        }`}
                      >
                        {coupon.active
                          ? "Activo"
                          : "Inactivo"}
                      </span>
                    </td>

                    {/* ACCIONES */}

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleCoupon(
                              coupon
                            )
                          }
                          className={`rounded-lg p-2 transition ${
                            coupon.active
                              ? "text-yellow-500 hover:bg-yellow-500/10"
                              : "text-green-500 hover:bg-green-500/10"
                          }`}
                          title={
                            coupon.active
                              ? "Desactivar"
                              : "Activar"
                          }
                        >
                          <Power
                            size={18}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteCoupon(
                              coupon
                            )
                          }
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10"
                          title="Eliminar"
                        >
                          <Trash2
                            size={18}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}