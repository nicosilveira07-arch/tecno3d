import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";

const SESSION_KEY = "tecno3d_welcome_coupon";
export const WELCOME_COUPON_EVENT =
  "tecno3d:welcome-coupon";

function readStoredWelcomeCoupon() {
  const raw = sessionStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export default function WelcomeCouponModal() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const openFromCoupon = (coupon) => {
      if (!coupon?.code) {
        return;
      }

      setCode(coupon.code);
      setOpen(true);
    };

    const stored = readStoredWelcomeCoupon();
    if (stored?.code) {
      openFromCoupon(stored);
    }

    const onStored = (event) => {
      openFromCoupon(
        event.detail || readStoredWelcomeCoupon()
      );
    };

    window.addEventListener(
      WELCOME_COUPON_EVENT,
      onStored
    );

    return () => {
      window.removeEventListener(
        WELCOME_COUPON_EVENT,
        onStored
      );
    };
  }, []);

  const close = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setOpen(false);
  };

  const copyCode = async () => {
    if (!code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AnimatePresence>
      {open && code && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-md rounded-2xl border border-green-800/60 bg-zinc-950 p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <p className="text-xs font-semibold uppercase tracking-widest text-green-500">
              Bienvenido a TECNO 3D
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              Tu 5% OFF ya está listo
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Usalo en el checkout. Aplica a todo el
              carrito, incluso ofertas. Un solo uso.
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <span className="flex-1 font-mono text-lg font-bold tracking-wider text-white">
                {code}
              </span>

              <button
                type="button"
                onClick={copyCode}
                className="rounded-lg bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700"
                aria-label="Copiar código"
              >
                {copied ? (
                  <Check size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>

            <Link
              to="/products"
              onClick={close}
              className="mt-5 block w-full rounded-xl bg-red-600 py-3 text-center text-sm font-bold text-white transition hover:bg-red-700"
            >
              Ir a comprar
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function storeWelcomeCoupon(coupon) {
  if (!coupon?.code) {
    return;
  }

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify(coupon)
  );

  window.dispatchEvent(
    new CustomEvent(WELCOME_COUPON_EVENT, {
      detail: coupon,
    })
  );
}