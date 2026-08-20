import { useEffect, useState } from "react";

import {
  getStoreSettings,
  updateStoreSettings,
} from "../services/storeSettings.api";

export default function AdminSettings() {
  const [form, setForm] = useState({
    storeName: "",
    description: "",
    logo: "",
    address: "",
    city: "",
    department: "",
    country: "",
    phone: "",
    email: "",
    whatsappNumber: "",
    whatsappMessage: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
    openingHours: "",

    // BANNER DE OFERTAS
    offerEnabled: true,
    offerEyebrow: "",
    offerTitle: "",
    offerDescription: "",
    offerButtonText: "",
    offerButtonUrl: "/offers",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response =
          await getStoreSettings();

        if (response.data) {
          setForm({
            storeName:
              response.data.storeName || "",
            description:
              response.data.description || "",
            logo:
              response.data.logo || "",
            address:
              response.data.address || "",
            city:
              response.data.city || "",
            department:
              response.data.department || "",
            country:
              response.data.country || "",
            phone:
              response.data.phone || "",
            email:
              response.data.email || "",
            whatsappNumber:
              response.data.whatsappNumber || "",
            whatsappMessage:
              response.data.whatsappMessage || "",
            instagram:
              response.data.instagram || "",
            facebook:
              response.data.facebook || "",
            tiktok:
              response.data.tiktok || "",
            youtube:
              response.data.youtube || "",
            openingHours:
              response.data.openingHours || "",

            // BANNER DE OFERTAS
            offerEnabled:
              response.data.offerEnabled ?? true,
            offerEyebrow:
              response.data.offerEyebrow || "",
            offerTitle:
              response.data.offerTitle || "",
            offerDescription:
              response.data.offerDescription || "",
            offerButtonText:
              response.data.offerButtonText || "",
            offerButtonUrl:
              response.data.offerButtonUrl || "/offers",
          });
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "No se pudo cargar la configuración."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateStoreSettings(form);

      setMessage(
        "Configuración guardada correctamente."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo guardar la configuración."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-zinc-400">
        Cargando configuración...
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
        Administración
      </p>

      <h1 className="mt-2 text-3xl font-black text-white">
        Configuración
      </h1>

      <p className="mt-2 text-zinc-400">
        Administrá la información pública de
        TECNO3D.
      </p>

      {message && (
        <div className="mt-6 rounded-xl border border-green-800 bg-green-950/40 px-4 py-3 text-sm text-green-400">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-8"
      >
        {/* INFORMACIÓN DEL NEGOCIO */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Información del negocio
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Nombre del negocio
              </label>

              <input
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Descripción
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Logo URL
            </label>

            <input
              name="logo"
              value={form.logo}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>
        </section>

        {/* UBICACIÓN */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Ubicación del local
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Dirección
              </label>

              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Ciudad
              </label>

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Departamento
              </label>

              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                País
              </label>

              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>
          </div>
        </section>

        {/* CONTACTO */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Contacto y WhatsApp
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Teléfono
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Número de WhatsApp
              </label>

              <input
                name="whatsappNumber"
                value={form.whatsappNumber}
                onChange={handleChange}
                placeholder="598XXXXXXXX"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Mensaje automático de WhatsApp
            </label>

            <textarea
              name="whatsappMessage"
              value={form.whatsappMessage}
              onChange={handleChange}
              rows={3}
              placeholder="Hola TECNO3D, quisiera consultar..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>
        </section>

        {/* REDES SOCIALES */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Redes sociales
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Instagram
              </label>

              <input
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Facebook
              </label>

              <input
                name="facebook"
                value={form.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                TikTok
              </label>

              <input
                name="tiktok"
                value={form.tiktok}
                onChange={handleChange}
                placeholder="https://tiktok.com/@..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                YouTube
              </label>

              <input
                name="youtube"
                value={form.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>
          </div>
        </section>

        {/* HORARIOS */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Horarios
          </h2>

          <div className="mt-5">
            <textarea
              name="openingHours"
              value={form.openingHours}
              onChange={handleChange}
              rows={3}
              placeholder="Lunes a viernes: 09:00 - 18:00"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>
        </section>

        {/* BANNER DE OFERTAS */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                Banner de ofertas
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Administrá el contenido de la oferta que aparece en la tienda.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <span className="text-sm font-semibold text-zinc-300">
                Mostrar banner
              </span>

              <input
                type="checkbox"
                name="offerEnabled"
                checked={form.offerEnabled}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    offerEnabled:
                      event.target.checked,
                  }))
                }
                className="h-5 w-5 accent-red-600"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Texto superior
              </label>

              <input
                name="offerEyebrow"
                value={form.offerEyebrow}
                onChange={handleChange}
                placeholder="Oferta de lanzamiento"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Título principal
              </label>

              <input
                name="offerTitle"
                value={form.offerTitle}
                onChange={handleChange}
                placeholder="Hasta 40% OFF"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Descripción
            </label>

            <textarea
              name="offerDescription"
              value={form.offerDescription}
              onChange={handleChange}
              rows={3}
              placeholder="Aprovechá descuentos exclusivos en nuestros productos."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Texto del botón
              </label>

              <input
                name="offerButtonText"
                value={form.offerButtonText}
                onChange={handleChange}
                placeholder="Ver ofertas"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Destino del botón
              </label>

              <input
                name="offerButtonUrl"
                value={form.offerButtonUrl}
                onChange={handleChange}
                placeholder="/offers"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>
          </div>
        </section>

        {/* GUARDAR */}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Guardando..."
              : "Guardar configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}

