import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X } from "lucide-react";
import { getStoreSettings } from "@/services/storeSettings.api";

function optimizeLogo(imageUrl) {
  if (
    !imageUrl ||
    !imageUrl.includes("res.cloudinary.com") ||
    !imageUrl.includes("/image/upload/")
  ) {
    return imageUrl;
  }

  return imageUrl.replace(
    "/image/upload/",
    "/image/upload/f_auto,q_auto,w_200/"
  );
}

const AUTH_CHANGE_EVENT = "tecno3d:auth-change";

function isGuest() {
  return !localStorage.getItem("token");
}

export function notifyAuthChange() {
  window.dispatchEvent(
    new Event(AUTH_CHANGE_EVENT)
  );
}

/** Centro del botón regalo (h-14) para la punta del globo */
const GIFT_TAIL_LEFT = "1.75rem";
const SPEECH_ORIGIN = `${GIFT_TAIL_LEFT} 100%`;

export default function FirstPurchaseFloat() {
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);
  const [panelOpen, setPanelOpen] =
    useState(false);
  const [email, setEmail] = useState("");
  const [logoSrc, setLogoSrc] =
    useState("/logo.webp");
  const [storeName, setStoreName] =
    useState("TECNO 3D");

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const response =
          await getStoreSettings();
        const settings =
          response?.data || {};

        if (settings.logo) {
          setLogoSrc(
            optimizeLogo(settings.logo)
          );
        }

        if (settings.storeName) {
          setStoreName(settings.storeName);
        }
      } catch (error) {
        console.error(
          "Error cargando logo de la tienda:",
          error
        );
      }
    };

    loadBranding();
  }, []);

  useEffect(() => {
    const sync = () => {
      const guest = isGuest();
      setVisible(guest);

      if (!guest) {
        setPanelOpen(false);
      }
    };

    sync();

    window.addEventListener(
      AUTH_CHANGE_EVENT,
      sync
    );
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);

    return () => {
      window.removeEventListener(
        AUTH_CHANGE_EVENT,
        sync
      );
      window.removeEventListener(
        "storage",
        sync
      );
      window.removeEventListener(
        "focus",
        sync
      );
    };
  }, []);

  const togglePanel = () => {
    setPanelOpen((value) => !value);
  };

  const closePanel = () => {
    setPanelOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      navigate("/register");
      closePanel();
      return;
    }

    navigate(
      `/register?email=${encodeURIComponent(trimmed)}`
    );
    closePanel();
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed bottom-5 left-4 z-[90] sm:bottom-6 sm:left-6"
      aria-live="polite"
    >
      <div className="relative flex flex-col items-start">
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: 24,
                scale: 0.4,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 18,
                scale: 0.88,
              }}
              style={{
                transformOrigin: SPEECH_ORIGIN,
              }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 28,
              }}
              className="pointer-events-auto relative z-20 -mb-[6px] w-[min(100vw-2rem,20rem)]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="first-purchase-title"
            >
              <div className="relative overflow-hidden rounded-2xl rounded-bl-md border border-zinc-700/90 bg-zinc-900 shadow-xl shadow-black/50">
                <button
                  type="button"
                  onClick={closePanel}
                  className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black/70"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>

                <div className="relative bg-gradient-to-br from-red-700 via-red-600 to-zinc-900 px-4 py-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_55%)]" />
                  <div className="relative flex flex-col items-center gap-2 text-center">
                    <img
                      src={logoSrc}
                      alt={storeName}
                      className="h-11 w-auto max-w-[9rem] object-contain drop-shadow-md"
                    />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
                      Primera compra
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-3 bg-zinc-900 p-4 pt-3"
                >
                  <div className="pr-6 text-center">
                    <h2
                      id="first-purchase-title"
                      className="text-lg font-black text-zinc-100"
                    >
                      Llevate{" "}
                      <span className="text-red-500">
                        5% OFF
                      </span>
                    </h2>
                    <p className="mt-1 text-xs leading-snug text-zinc-400">
                      Registrate y recibí un código para
                      tu primera compra, también en
                      ofertas.
                    </p>
                  </div>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Tu email"
                    autoComplete="email"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-600"
                  />

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    Quiero mi 5% OFF
                  </button>

                  <button
                    type="button"
                    onClick={closePanel}
                    className="w-full text-xs text-zinc-500 transition hover:text-zinc-300"
                  >
                    No, gracias
                  </button>
                </form>
              </div>

              <span
                aria-hidden
                className="absolute -bottom-[7px] left-7 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b border-l border-zinc-700/90 bg-zinc-900"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={togglePanel}
          aria-expanded={panelOpen}
          className={`pointer-events-auto relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border bg-red-600 text-white shadow-lg transition hover:scale-105 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
            panelOpen
              ? "border-red-400 shadow-red-950/60 ring-2 ring-red-500/30"
              : "border-red-500/40 shadow-red-950/50"
          }`}
          aria-label={
            panelOpen
              ? "Cerrar promoción 5% OFF"
              : "Abrir promoción 5% OFF en tu primera compra"
          }
          title="5% OFF primera compra"
        >
          <Gift
            className="h-7 w-7"
            strokeWidth={2}
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}