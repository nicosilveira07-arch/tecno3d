import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getStoreSettings } from "@/services/storeSettings.api";

const DISMISSED_UNTIL_KEY =
  "tecno3d_whatsapp_dismissed_until";
const LAST_SHOWN_KEY =
  "tecno3d_whatsapp_last_shown";

const SHOW_DELAY_MS = 1800;
const NAV_COOLDOWN_MS = 12_000;
const DISMISS_COOLDOWN_MS = 3 * 60 * 1000;

const canShowWhatsAppHint = () => {
  const dismissedUntil = Number(
    sessionStorage.getItem(
      DISMISSED_UNTIL_KEY
    ) || 0
  );

  if (Date.now() < dismissedUntil) {
    return false;
  }

  const lastShown = Number(
    sessionStorage.getItem(LAST_SHOWN_KEY) ||
      0
  );

  if (
    lastShown &&
    Date.now() - lastShown < NAV_COOLDOWN_MS
  ) {
    return false;
  }

  return true;
};

const markHintShown = () => {
  sessionStorage.setItem(
    LAST_SHOWN_KEY,
    String(Date.now())
  );
};

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 fill-current text-white"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function WhatsAppFloat() {
  const location = useLocation();
  const [whatsappUrl, setWhatsappUrl] =
    useState(null);
  const [hintOpen, setHintOpen] =
    useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response =
          await getStoreSettings();
        const settings =
          response.data || {};
        const digits =
          settings.whatsappNumber?.replace(
            /\D/g,
            ""
          );

        if (!digits) {
          return;
        }

        const text = encodeURIComponent(
          settings.whatsappMessage ||
            "Hola TECNO3D, quisiera realizar una consulta."
        );

        setWhatsappUrl(
          `https://wa.me/${digits}?text=${text}`
        );
      } catch (error) {
        console.error(
          "Error cargando WhatsApp:",
          error
        );
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!whatsappUrl) {
      return;
    }

    sessionStorage.removeItem(
      "tecno3d_whatsapp_hint"
    );

    if (!canShowWhatsAppHint()) {
      setHintOpen(false);
      return;
    }

    setHintOpen(false);

    const timer = setTimeout(() => {
      if (!canShowWhatsAppHint()) {
        return;
      }

      setHintOpen(true);
      markHintShown();
    }, SHOW_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname, whatsappUrl]);

  const dismissHint = () => {
    sessionStorage.setItem(
      DISMISSED_UNTIL_KEY,
      String(
        Date.now() + DISMISS_COOLDOWN_MS
      )
    );
    setHintOpen(false);
  };

  if (!whatsappUrl) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-4 z-[90] flex flex-col items-end sm:bottom-6 sm:right-6"
      aria-live="polite"
    >
      <AnimatePresence>
        {hintOpen && (
          <motion.div
            key={location.pathname}
            initial={{
              opacity: 0,
              y: 10,
              scale: 0.92,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 8,
              scale: 0.95,
            }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 28,
            }}
            className="pointer-events-auto relative mb-2 max-w-[min(280px,calc(100vw-2rem))] origin-bottom-right rounded-2xl rounded-br-sm border border-zinc-700/90 bg-zinc-900 px-4 py-3 pr-9 text-sm leading-snug text-zinc-100 shadow-xl shadow-black/50"
          >
            <button
              type="button"
              onClick={dismissHint}
              className="absolute right-2 top-2 rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
              aria-label="Cerrar mensaje"
            >
              <X size={16} />
            </button>

            <p className="m-0">
              ¿Tenés dudas? Escribinos, te
              respondemos al toque{" "}
              <span aria-hidden>👋</span>
            </p>

            <span
              aria-hidden
              className="absolute -bottom-[7px] right-[1.35rem] h-3.5 w-3.5 rotate-45 border-b border-r border-zinc-700/90 bg-zinc-900"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/40 bg-red-600 text-white shadow-lg shadow-red-950/50 transition hover:scale-105 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-zinc-950"
        aria-label="Chatear por WhatsApp con TECNO 3D"
      >
        <WhatsAppIcon />
      </a>
    </div>
  );
}