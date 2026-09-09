import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Store,
  Receipt,
  CreditCard,
  Clock,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { getCheckoutSession } from "../services/checkoutSession.api";

export default function PaymentPending() {
  const [searchParams] = useSearchParams();

  const externalReference =
    searchParams.get("external_reference");

  const paymentType =
    searchParams.get("payment_type");

  const isTicketPayment =
    paymentType === "ticket";

  const [session, setSession] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    async function loadCheckoutSession() {
      if (!externalReference) {
        setError(
          "No se encontró la referencia de la compra."
        );

        setLoading(false);

        return;
      }

      try {
        const data =
          await getCheckoutSession(
            externalReference
          );

        setSession(data);
      } catch (err) {
        console.error(
          "ERROR OBTENIENDO CHECKOUT SESSION:",
          err
        );

        setError(
          "No pudimos cargar la información de tu pago."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCheckoutSession();
  }, [externalReference]);

  if (loading) {
    return (
      <section className="min-h-[70vh] px-6 py-16">
        <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-yellow-500" />

            <h1 className="mt-6 text-2xl font-bold text-white">
              Cargando información del pago...
            </h1>

            <p className="mt-2 text-zinc-400">
              Estamos preparando los datos de tu compra.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !session) {
    return (
      <section className="min-h-[70vh] px-6 py-16">
        <div className="mx-auto w-full max-w-3xl">
          <div className="rounded-3xl border border-red-900/40 bg-zinc-900 p-8 text-center shadow-2xl">
            <CreditCard className="mx-auto h-14 w-14 text-red-500" />

            <h1 className="mt-6 text-3xl font-black text-white">
              No pudimos cargar tu pago
            </h1>

            <p className="mt-4 text-zinc-400">
              {error ||
                "No encontramos la información de esta compra."}
            </p>

            <div className="mt-8 flex justify-center">
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-600 px-6 py-3 font-bold text-white transition hover:bg-yellow-700"
              >
                <ArrowLeft className="h-5 w-5" />
                Volver a la tienda
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const paymentReferenceId =
    session.paymentReferenceId;

  const paymentVerificationCode =
    session.paymentVerificationCode;

  const paymentInstructionsUrl =
    session.paymentInstructionsUrl;

  const hasTicketData =
    Boolean(
      paymentVerificationCode ||
        paymentReferenceId ||
        paymentInstructionsUrl
    );

  const total =
    Number(session.total || 0).toFixed(2);

  return (
    <section className="min-h-[70vh] px-6 py-16">
      <div className="mx-auto w-full max-w-3xl">

        {/* ENCABEZADO */}

        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-950">
            <Store className="h-10 w-10 text-yellow-500" />
          </div>

          <h1 className="text-4xl font-black text-white">
            Pago pendiente
          </h1>

          <p className="mt-4 text-lg text-zinc-400">
            Tu compra está pendiente de pago.
          </p>
        </div>

        {/* TARJETA PRINCIPAL */}

        <div className="rounded-3xl border border-yellow-900/50 bg-zinc-900 p-8 shadow-2xl">

          {isTicketPayment ? (
            <>
              {/* MEDIO DE PAGO */}

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-950">
                    <Store className="h-6 w-6 text-yellow-500" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Redpagos o Abitab
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                      Completá el pago en el local indicado
                      por Mercado Pago.
                    </p>
                  </div>
                </div>
              </div>

              {/* TOTAL */}

              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">
                    Total a pagar
                  </span>

                  <span className="text-3xl font-black text-white">
                    $ {total}
                  </span>
                </div>
              </div>

              {hasTicketData ? (
                <>
                  {/* CÓDIGO DE PAGO */}

                  {paymentVerificationCode && (
                    <div className="mt-8 rounded-2xl border border-yellow-900/50 bg-yellow-950/20 p-6">
                      <div className="flex items-center gap-3">
                        <Receipt className="h-6 w-6 text-yellow-500" />

                        <h2 className="text-xl font-bold text-white">
                          Código de pago
                        </h2>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-zinc-400">
                        Utilizá este código siguiendo las
                        instrucciones proporcionadas por
                        Mercado Pago para completar el pago.
                      </p>

                      <div className="mt-5 rounded-xl border border-yellow-800/50 bg-zinc-950 px-5 py-4 text-center">
                        <p className="break-all text-3xl font-black tracking-wider text-yellow-500">
                          {paymentVerificationCode}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* REFERENCIA */}

                  {paymentReferenceId &&
                    paymentReferenceId !==
                      paymentVerificationCode && (
                      <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                        <p className="text-sm text-zinc-400">
                          Número de referencia
                        </p>

                        <p className="mt-2 text-xl font-bold tracking-wide text-white">
                          {paymentReferenceId}
                        </p>
                      </div>
                    )}

                  {/* INSTRUCCIONES */}

                  {paymentInstructionsUrl && (
                    <div className="mt-6">
                      <a
                        href={paymentInstructionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-6 py-4 font-bold text-white transition hover:border-yellow-600 hover:text-yellow-500"
                      >
                        Ver instrucciones de Mercado Pago
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                  )}

                  {/* PASOS */}

                  <div className="mt-8">
                    <h2 className="text-xl font-bold text-white">
                      ¿Qué tenés que hacer?
                    </h2>

                    <div className="mt-5 space-y-5">

                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold text-yellow-500">
                          1
                        </div>

                        <div>
                          <h3 className="font-bold text-white">
                            Acercate a un local
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-zinc-400">
                            Dirigite a un local de Redpagos o
                            Abitab.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold text-yellow-500">
                          2
                        </div>

                        <div>
                          <h3 className="font-bold text-white">
                            Informá que es un pago de Mercado Pago
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-zinc-400">
                            Indicá al cajero que vas a realizar
                            un pago de Mercado Pago.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold text-yellow-500">
                          3
                        </div>

                        <div>
                          <h3 className="font-bold text-white">
                            Presentá el código o referencia
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-zinc-400">
                            Utilizá el dato indicado por Mercado
                            Pago para localizar y completar la
                            operación.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold text-yellow-500">
                          4
                        </div>

                        <div>
                          <h3 className="font-bold text-white">
                            Conservá el comprobante
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-zinc-400">
                            Guardá el comprobante hasta que el
                            pago quede acreditado.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* AVISO */}

                  <div className="mt-8 flex gap-4 rounded-2xl border border-yellow-900/30 bg-yellow-950/10 p-5">
                    <Clock className="h-6 w-6 shrink-0 text-yellow-500" />

                    <div>
                      <h3 className="font-bold text-white">
                        Tu compra todavía no está confirmada
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        La compra se confirmará automáticamente
                        cuando Mercado Pago informe que el pago
                        fue acreditado.
                      </p>
                    </div>
                  </div>

                  {/* CONFIRMACIÓN */}

                  <div className="mt-5 flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />

                    <div>
                      <h3 className="font-bold text-white">
                        El pago está registrado
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        Mercado Pago registró correctamente la
                        operación y estamos esperando su
                        acreditación.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                /* TODAVÍA NO LLEGÓ EL WEBHOOK */

                <div className="mt-8 rounded-2xl border border-yellow-900/40 bg-yellow-950/10 p-6">
                  <div className="flex gap-4">
                    <Clock className="h-6 w-6 shrink-0 text-yellow-500" />

                    <div>
                      <h2 className="font-bold text-white">
                        Estamos preparando las instrucciones de pago
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Mercado Pago todavía no nos envió los
                        datos necesarios para mostrarte la
                        información del pago.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* OTROS PAGOS PENDIENTES */

            <div className="text-center">
              <CreditCard className="mx-auto h-12 w-12 text-yellow-500" />

              <h2 className="mt-4 text-2xl font-bold text-white">
                Estamos esperando la confirmación del pago
              </h2>

              <p className="mt-3 text-zinc-400">
                Todavía no recibimos la confirmación definitiva
                de Mercado Pago.
              </p>

              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <p className="text-sm text-zinc-400">
                  Total
                </p>

                <p className="mt-1 text-2xl font-black text-white">
                  $ {total}
                </p>
              </div>
            </div>
          )}

          {/* ACCIONES */}

          <div className="mt-8 flex justify-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-600 px-6 py-3 font-bold text-white transition hover:bg-yellow-700"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver a la tienda
            </a>
          </div>

          {/* REFERENCIA INTERNA */}

          {externalReference && (
            <p className="mt-6 text-center text-xs text-zinc-700">
              Referencia interna de compra:{" "}
              {externalReference}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

