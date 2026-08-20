import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { getStoreSettings } from "../../services/storeSettings.api";
export default function OfferBanner() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await getStoreSettings();

        setSettings(response.data);
      } catch (error) {
        console.error(
          "No se pudo cargar la configuración de ofertas:",
          error
        );
      }
    };

    loadSettings();
  }, []);

  if (!settings || settings.offerEnabled === false) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-red-700 via-red-600 to-red-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 py-16 lg:flex-row">
        {/* CONTENIDO */}

        <div>
          <p className="text-sm uppercase tracking-widest text-red-100">
            {settings.offerEyebrow || "Ofertas destacadas"}
          </p>

          <h2 className="mt-3 text-4xl font-black text-white">
            {settings.offerTitle ||
              "Precios especiales por tiempo limitado"}
          </h2>

          <p className="mt-3 max-w-xl text-red-100">
            {settings.offerDescription ||
              "Aprovechá nuestras ofertas en tecnología, gaming, impresión 3D y accesorios."}
          </p>
        </div>

        {/* BOTÓN */}

        <Link
          to={settings.offerButtonUrl || "/offers"}
          className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-red-600 transition hover:scale-105"
        >
          {settings.offerButtonText || "Ver ofertas"}

          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}