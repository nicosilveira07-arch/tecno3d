import {
  useEffect,
  useState,
} from "react";
import {
  Loader2,
  Send,
} from "lucide-react";

import {
  getAdminQuotes,
  sendQuotePrice,
} from "@/services/quotes.api";

import QuoteReferenceImages from "@/components/quotes/QuoteReferenceImages";

import {
  formatQuoteMeasurement,
} from "@/features/quotes/quoteSpecs";

const STATUS_TABS = [
  { id: "", label: "Todas" },
  {
    id: "PENDING",
    label: "Pendientes",
  },
  {
    id: "QUOTED",
    label: "Cotizadas",
  },
  {
    id: "REJECTED_BY_CUSTOMER",
    label: "Rechazadas",
  },
  { id: "PAID", label: "Pagadas" },
];

const STATUS_LABELS = {
  PENDING: "Producto a cotizar",
  QUOTED: "Precio enviado",
  ACCEPTED: "Aceptada",
  PAID: "Pagada",
  REJECTED_BY_CUSTOMER:
    "Rechazada por cliente",
};

function formatPrice(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "es-UY",
    {
      style: "currency",
      currency: "UYU",
      maximumFractionDigits: 0,
    }
  ).format(Number(value));
}

export default function AdminQuotes() {
  const [quotes, setQuotes] =
    useState([]);

  const [statusFilter, setStatusFilter] =
    useState("PENDING");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [forms, setForms] = useState({});

  const [savingId, setSavingId] =
    useState(null);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAdminQuotes(
          statusFilter || undefined
        );

      const list = response.data || [];

      setQuotes(list);

      const nextForms = {};

      for (const quote of list) {
        nextForms[quote.id] = {
          quotedPrice:
            quote.quotedPrice ?? "",
          adminMessage:
            quote.adminMessage ?? "",
        };
      }

      setForms(nextForms);
    } catch (loadError) {
      setError(
        loadError.response?.data
          ?.message ||
          "No se pudieron cargar las cotizaciones."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [statusFilter]);

  const handleFormChange = (
    quoteId,
    field,
    value
  ) => {
    setForms((previous) => ({
      ...previous,
      [quoteId]: {
        ...previous[quoteId],
        [field]: value,
      },
    }));
  };

  const handleSendQuote = async (quoteId) => {
    const form = forms[quoteId];

    try {
      setSavingId(quoteId);
      setError("");
      setSuccess("");

      await sendQuotePrice(quoteId, {
        quotedPrice: Number(
          form.quotedPrice
        ),
        adminMessage:
          form.adminMessage || undefined,
      });

      setSuccess(
        "Precio enviado al cliente."
      );

      await loadQuotes();
    } catch (sendError) {
      setError(
        sendError.response?.data
          ?.message ||
          "No se pudo enviar el precio."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
        Administración
      </p>

      <h1 className="mt-2 text-3xl font-black text-white">
        Cotizaciones
      </h1>

      <p className="mt-2 text-zinc-400">
        Solicitudes de productos personalizados.
        Las nuevas aparecen como «producto a
        cotizar».
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id || "all"}
            type="button"
            onClick={() =>
              setStatusFilter(tab.id)
            }
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              statusFilter === tab.id
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-4 text-sm text-emerald-400">
          {success}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-zinc-500">
          Cargando...
        </p>
      ) : quotes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
          No hay cotizaciones en este filtro.
        </div>
      ) : (
        <ul className="mt-8 space-y-6">
          {quotes.map((quote) => (
            <li
              key={quote.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <QuoteReferenceImages
                  quote={quote}
                />

                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold uppercase text-red-400">
                    {STATUS_LABELS[
                      quote.status
                    ] || quote.status}
                  </span>

                  <p className="mt-3 text-sm font-semibold text-white">
                    {formatQuoteMeasurement(
                      quote.widthMm,
                      quote.heightMm
                    )}{" "}
                    · Cantidad:{" "}
                    {quote.quantity ?? "—"}
                  </p>

                  {quote.description?.trim() && (
                    <p className="mt-2 text-sm text-zinc-400">
                      {quote.description}
                    </p>
                  )}

                  <p className="mt-3 text-sm text-zinc-500">
                    Cliente:{" "}
                    <span className="text-zinc-300">
                      {quote.user?.firstName}{" "}
                      {quote.user?.lastName}
                    </span>
                    {" · "}
                    {quote.user?.email}
                  </p>

                  {quote.contactPhone && (
                    <p className="mt-1 text-sm text-zinc-500">
                      Contacto cotización:{" "}
                      <a
                        href={`tel:${quote.contactPhone.replace(/\s/g, "")}`}
                        className="font-semibold text-emerald-400 hover:text-emerald-300"
                      >
                        {quote.contactPhone}
                      </a>
                    </p>
                  )}

                  {quote.status ===
                    "REJECTED_BY_CUSTOMER" &&
                    quote.rejectedAt && (
                      <p className="mt-2 text-sm text-amber-400">
                        Producto rechazado por{" "}
                        {quote.user?.firstName}{" "}
                        {quote.user?.lastName}{" "}
                        el{" "}
                        {new Date(
                          quote.rejectedAt
                        ).toLocaleString(
                          "es-UY"
                        )}
                      </p>
                    )}

                  {quote.quotedPrice !=
                    null && (
                    <p className="mt-2 font-bold text-white">
                      Precio cotizado:{" "}
                      {formatPrice(
                        quote.quotedPrice
                      )}
                    </p>
                  )}

                  {quote.status ===
                    "PENDING" && (
                    <div className="mt-5 flex max-w-3xl flex-col gap-4">
                      <div className="min-w-0">
                        <p className="font-bold text-white">
                          Precio (UYU)
                        </p>
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          aria-label="Precio en pesos uruguayos"
                          value={
                            forms[quote.id]
                              ?.quotedPrice ?? ""
                          }
                          onChange={(event) => {
                            const digits =
                              event.target.value.replace(
                                /\D/g,
                                ""
                              );

                            handleFormChange(
                              quote.id,
                              "quotedPrice",
                              digits
                            );
                          }}
                          placeholder="15000"
                          className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-base font-semibold tabular-nums text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-white">
                          Mensaje al cliente
                          <span className="ml-1 text-sm font-normal text-zinc-500">
                            (opcional)
                          </span>
                        </p>
                        <textarea
                          rows={3}
                          value={
                            forms[quote.id]
                              ?.adminMessage ?? ""
                          }
                          onChange={(event) =>
                            handleFormChange(
                              quote.id,
                              "adminMessage",
                              event.target
                                .value
                            )
                          }
                          placeholder="Plazo, materiales, observaciones..."
                          aria-label="Mensaje al cliente"
                          className="mt-2 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none min-h-[3rem]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleSendQuote(
                            quote.id
                          )
                        }
                        disabled={
                          savingId === quote.id
                        }
                        className="inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50"
                      >
                        {savingId ===
                        quote.id ? (
                          <Loader2
                            className="animate-spin"
                            size={16}
                          />
                        ) : (
                          <Send size={16} />
                        )}
                        Enviar cotización
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}