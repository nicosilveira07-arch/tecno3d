import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";

export default function PaymentFailure() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-red-900/50 bg-zinc-900 p-10 text-center shadow-2xl">

        {/* ICONO */}

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-950">
          <XCircle className="h-12 w-12 text-red-500" />
        </div>

        {/* TITULO */}

        <h1 className="text-4xl font-black text-white">
          Pago rechazado
        </h1>

        {/* MENSAJE PRINCIPAL */}

        <p className="mt-4 text-lg text-zinc-400">
          No pudimos procesar tu pago.
        </p>

        {/* INFORMACIÓN */}

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-left">
          <h2 className="font-bold text-white">
            ¿Qué pasó?
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            La operación de pago fue rechazada por Mercado
            Pago. La compra temporal fue marcada como fallida
            y no se creó ningún pedido.
          </p>

          <p className="mt-4 text-sm leading-6 text-zinc-400">
            No se descontó stock ni se generó un cobro
            confirmado.
          </p>
        </div>

        {/* ACCIONES */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <a
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
          >
            <RotateCcw className="h-5 w-5" />
            Intentar nuevamente
          </a>

          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-6 py-3 font-bold text-white transition hover:border-zinc-500"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver a la tienda
          </a>

        </div>

      </div>
    </section>
  );
}

