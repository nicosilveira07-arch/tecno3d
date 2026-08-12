export default function PaymentPending() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-yellow-900/50 bg-zinc-900 p-10 text-center shadow-2xl">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-950">
          <span className="text-4xl text-yellow-500">
            !
          </span>
        </div>

        <h1 className="text-4xl font-black text-white">
          Pago pendiente
        </h1>

        <p className="mt-4 text-lg text-zinc-400">
          Tu pago todavía no fue acreditado.
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Tu pedido permanece pendiente y el stock no fue descontado.
        </p>

        <a
          href="/orders"
          className="mt-8 inline-block rounded-xl bg-yellow-600 px-6 py-3 font-bold text-white transition hover:bg-yellow-700"
        >
          Ver mis pedidos
        </a>

      </div>
    </section>
  );
}

