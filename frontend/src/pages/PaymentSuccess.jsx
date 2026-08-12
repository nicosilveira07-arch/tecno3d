import { useEffect } from "react";

import {
  clearCart,
} from "@/features/cart/cart.store";

export default function PaymentSuccess() {
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-green-900/50 bg-zinc-900 p-10 text-center shadow-2xl">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-950">
          <span className="text-4xl text-green-500">
            ✓
          </span>
        </div>

        <h1 className="text-4xl font-black text-white">
          ¡Pago realizado!
        </h1>

        <p className="mt-4 text-lg text-zinc-400">
          Tu pago fue recibido correctamente.
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Tu pedido fue confirmado y comenzará a procesarse.
        </p>

        <a
          href="/orders"
          className="mt-8 inline-block rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
        >
          Ver mis pedidos
        </a>

      </div>
    </section>
  );
}


