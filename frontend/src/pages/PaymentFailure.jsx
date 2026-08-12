export default function PaymentFailure() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-red-900/50 bg-zinc-900 p-10 text-center shadow-2xl">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-950">
          <span className="text-4xl text-red-500">
            ✕
          </span>
        </div>

        <h1 className="text-4xl font-black text-white">
          Pago rechazado
        </h1>

        <p className="mt-4 text-lg text-zinc-400">
          No pudimos procesar tu pago.
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Tu pedido permanece pendiente y no se descontó stock.
        </p>

        <a
          href="/checkout"
          className="mt-8 inline-block rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
        >
          Intentar nuevamente
        </a>

      </div>
    </section>
  );
}

