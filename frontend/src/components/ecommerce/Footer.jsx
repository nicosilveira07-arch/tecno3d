import { useEffect, useState } from "react";

import {
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

import { getStoreSettings } from "../../services/storeSettings.api";

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await getStoreSettings();

        setSettings(response.data);
      } catch (error) {
        console.error(
          "Error al cargar configuración del Footer:",
          error
        );

        setSettings({});
      }
    };

    loadSettings();
  }, []);

  const storeName =
    settings?.storeName || "TECNO3D";

  const description =
    settings?.description ||
    "Tecnología • Gaming • Impresión 3D";

  const whatsappNumber =
    settings?.whatsappNumber?.replace(/\D/g, "");

  const whatsappMessage = encodeURIComponent(
    settings?.whatsappMessage ||
      "Hola TECNO3D, quisiera realizar una consulta."
  );

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : null;

  return (
    <footer className="border-t border-zinc-800 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* NEGOCIO */}

          <div>
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt={storeName}
                className="h-14 w-auto object-contain"
              />
            ) : (
              <h2 className="text-2xl font-black text-white">
                {storeName}
              </h2>
            )}

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              {description}
            </p>
          </div>

          {/* UBICACIÓN */}

          <div>
            <h3 className="font-bold text-white">
              Local
            </h3>

            <div className="mt-4 space-y-3 text-sm text-zinc-500">

              {(settings?.address ||
                settings?.city ||
                settings?.department ||
                settings?.country) && (
                <div className="flex gap-3">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <span>
                    {settings?.address}

                    {settings?.city &&
                      `, ${settings.city}`}

                    {settings?.department &&
                      `, ${settings.department}`}

                    {settings?.country &&
                      `, ${settings.country}`}
                  </span>
                </div>
              )}

              {settings?.openingHours && (
                <div>
                  <span className="font-semibold text-zinc-300">
                    Horarios:
                  </span>{" "}
                  {settings.openingHours}
                </div>
              )}

            </div>
          </div>

          {/* CONTACTO */}

          <div>
            <h3 className="font-bold text-white">
              Contacto
            </h3>

            <div className="mt-4 space-y-3 text-sm">

              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-3 text-zinc-500 transition hover:text-white"
                >
                  <Phone
                    size={18}
                    className="text-red-500"
                  />

                  {settings.phone}
                </a>
              )}

              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 text-zinc-500 transition hover:text-white"
                >
                  <Mail
                    size={18}
                    className="text-red-500"
                  />

                  {settings.email}
                </a>
              )}

            </div>
          </div>

          {/* REDES SOCIALES */}

          <div>
            <h3 className="font-bold text-white">
              Seguinos
            </h3>

            <div className="mt-4 flex flex-wrap gap-3">

              {/* WHATSAPP */}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  title="WhatsApp"
                  className="rounded-lg border border-zinc-800 p-3 text-zinc-400 transition hover:border-green-500 hover:text-green-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.5 0 .2 5.3.2 11.9c0 2.1.6 4.1 1.6 5.8L.1 24l6.5-1.7c1.6.9 3.5 1.4 5.4 1.4h.1c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.3-6.1-3.5-8.3ZM12.1 21.5c-1.7 0-3.4-.5-4.8-1.3l-.3-.2-3.9 1 1-3.8-.2-.3c-1-1.5-1.5-3.2-1.5-5 0-5.2 4.3-9.5 9.5-9.5 2.5 0 4.9 1 6.7 2.8 1.8 1.8 2.8 4.2 2.8 6.7 0 5.3-4.3 9.6-9.3 9.6Zm5.2-7.1c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.1-.7.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1 2.9 1.1 3.1c.1.2 2 3.1 4.9 4.3.7.3 1.3.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.8-.7 2.1-1.4.3-.7.3-1.3.2-1.4 0-.1-.2-.2-.5-.3Z" />
                  </svg>
                </a>
              )}

              {/* INSTAGRAM */}

              {settings?.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                  className="rounded-lg border border-zinc-800 p-3 text-zinc-400 transition hover:border-pink-500 hover:text-pink-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                    />

                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="1"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                </a>
              )}

              {/* FACEBOOK */}

              {settings?.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  title="Facebook"
                  className="rounded-lg border border-zinc-800 p-3 text-zinc-400 transition hover:border-blue-500 hover:text-blue-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v3H6v4h3v8h4v-8h3.5l.5-4H13V9c0-.7.3-1 1-1Z" />
                  </svg>
                </a>
              )}

              {/* TIKTOK */}

              {settings?.tiktok && (
                <a
                  href={settings.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  title="TikTok"
                  className="rounded-lg border border-zinc-800 p-3 text-zinc-400 transition hover:border-white hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M19.6 7.2a5.8 5.8 0 0 1-3.4-1.1v7.1a5.8 5.8 0 1 1-5-5.7v3.1a2.8 2.8 0 1 0 2 2.6V2h3a5.8 5.8 0 0 0 3.4 2.8v2.4Z" />
                  </svg>
                </a>
              )}

              {/* YOUTUBE */}

              {settings?.youtube && (
                <a
                  href={settings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  title="YouTube"
                  className="rounded-lg border border-zinc-800 p-3 text-zinc-400 transition hover:border-red-500 hover:text-red-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8ZM9.6 15.5v-7l6.3 3.5-6.3 3.5v0Z" />
                  </svg>
                </a>
              )}

      

              

            </div>

            <p className="mt-4 text-xs text-zinc-600">
              Contactanos por nuestras redes o WhatsApp.
            </p>
          </div>

        </div>

        {/* COPYRIGHT */}

        <div className="mt-10 border-t border-zinc-800 pt-6 text-sm text-zinc-600">
          © 2026 {storeName}. Todos los derechos reservados.
        </div>

      </div>
    </footer>
  );
}

