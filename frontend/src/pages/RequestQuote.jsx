import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  ImagePlus,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";

import { compressQuoteImages } from "@/utils/compressQuoteImage";

import {
  createQuoteRequest,
  getMyQuotes,
  acceptQuote,
  rejectQuote,
} from "@/services/quotes.api";

import {
  QUOTE_MIN_MM,
  QUOTE_MAX_MM,
  QUOTE_MIN_IMAGES,
  QUOTE_MAX_IMAGES,
  QUOTE_MM_VALUES,
  QUOTE_MM_DATALIST_ID,
  formatQuoteMeasurement,
  getQuoteCoverImage,
} from "@/features/quotes/quoteSpecs";

const STATUS_LABELS = {
  PENDING: "En revisión",
  QUOTED: "Precio disponible",
  ACCEPTED: "Aceptada · pago pendiente",
  PAID: "Pagada",
  REJECTED_BY_CUSTOMER: "Rechazada",
};

const getQuoteStatusStyle = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/10 text-amber-300 border-amber-500/30";
    case "QUOTED":
      return "bg-blue-500/10 text-blue-300 border-blue-500/30";
    case "ACCEPTED":
      return "bg-purple-500/10 text-purple-300 border-purple-500/30";
    case "PAID":
      return "bg-green-500/10 text-green-300 border-green-500/30";
    case "REJECTED_BY_CUSTOMER":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-600/40";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
  }
};

const formatQuoteDate = (date) => {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleString(
    "es-UY",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
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

export default function RequestQuote() {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    () => {
      try {
        return JSON.parse(
          localStorage.getItem("user") ||
            "null"
        );
      } catch {
        return null;
      }
    }
  );

  const [description, setDescription] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [widthMm, setWidthMm] =
    useState("");

  const [heightMm, setHeightMm] =
    useState("");

  const [contactPhone, setContactPhone] =
    useState("");

  const contactPrefilled = useRef(false);

  const [imageFiles, setImageFiles] =
    useState([]);

  const [previewUrls, setPreviewUrls] =
    useState([]);

  const [quotes, setQuotes] =
    useState([]);

  const [loadingQuotes, setLoadingQuotes] =
    useState(false);

  const [quotesLoadError, setQuotesLoadError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [compressingImages, setCompressingImages] =
    useState(false);

  const [actionId, setActionId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [rejectConfirm, setRejectConfirm] =
    useState(null);

  const hasAuth = Boolean(
    localStorage.getItem("token") && user
  );

  const isCustomer = user?.role === "CUSTOMER";

  const isStaff =
    user?.role === "ADMIN" ||
    user?.role === "EMPLOYEE";

  const canSubmit = isCustomer;

  useEffect(() => {
    if (
      user?.phone &&
      !contactPrefilled.current
    ) {
      setContactPhone(user.phone);
      contactPrefilled.current = true;
    }
  }, [user]);

  useEffect(() => {
    const onAuth = () => {
      try {
        setUser(
          JSON.parse(
            localStorage.getItem("user") ||
              "null"
          )
        );
      } catch {
        setUser(null);
      }
    };

    window.addEventListener(
      "tecno3d:auth-change",
      onAuth
    );

    return () => {
      window.removeEventListener(
        "tecno3d:auth-change",
        onAuth
      );
    };
  }, []);

  const loadQuotes = async () => {
    if (!isCustomer) {
      return;
    }

    try {
      setLoadingQuotes(true);
      setQuotesLoadError("");

      const response =
        await getMyQuotes();

      setQuotes(response.data || []);
    } catch (loadError) {
      console.error(loadError);
      setQuotes([]);
      setQuotesLoadError(
        loadError.response?.data
          ?.message ||
          "No se pudieron cargar tus cotizaciones."
      );
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [isCustomer]);

  const syncImagePreviews = (files) => {
    previewUrls.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setImageFiles(files);
    setPreviewUrls(
      files.map((file) =>
        URL.createObjectURL(file)
      )
    );
  };

  const handleImagesChange = async (event) => {
    const selected = Array.from(
      event.target.files || []
    );

    if (selected.length === 0) {
      return;
    }

    const roomLeft =
      QUOTE_MAX_IMAGES - imageFiles.length;

    if (roomLeft <= 0) {
      event.target.value = "";
      return;
    }

    const toProcess = selected.slice(
      0,
      roomLeft
    );

    try {
      setCompressingImages(true);
      setError("");

      const compressed =
        await compressQuoteImages(
          toProcess
        );

      const merged = [
        ...imageFiles,
        ...compressed,
      ].slice(0, QUOTE_MAX_IMAGES);

      syncImagePreviews(merged);
    } catch (compressError) {
      setError(
        compressError.message ||
          "No se pudieron optimizar las imágenes."
      );
    } finally {
      setCompressingImages(false);
      event.target.value = "";
    }
  };

  const removeImageAt = (index) => {
    const next = imageFiles.filter(
      (_, fileIndex) => fileIndex !== index
    );

    syncImagePreviews(next);
  };

  const parseDigits = (value, maxDigits) => {
    return value
      .replace(/\D/g, "")
      .slice(0, maxDigits);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      if (!hasAuth) {
        navigate("/login?next=/cotizar");
      }
      return;
    }

    if (
      imageFiles.length < QUOTE_MIN_IMAGES ||
      imageFiles.length > QUOTE_MAX_IMAGES
    ) {
      setError(
        `Adjuntá entre ${QUOTE_MIN_IMAGES} y ${QUOTE_MAX_IMAGES} imágenes de ejemplo.`
      );
      return;
    }

    const width = Number(widthMm);
    const height = Number(heightMm);
    if (
      !Number.isInteger(width) ||
      width < QUOTE_MIN_MM ||
      width > QUOTE_MAX_MM
    ) {
      setError(
        `El ancho debe ser entre ${QUOTE_MIN_MM} y ${QUOTE_MAX_MM} mm.`
      );
      return;
    }

    if (
      !Number.isInteger(height) ||
      height < QUOTE_MIN_MM ||
      height > QUOTE_MAX_MM
    ) {
      setError(
        `El alto debe ser entre ${QUOTE_MIN_MM} y ${QUOTE_MAX_MM} mm.`
      );
      return;
    }

    const qty = Number(quantity);

    if (
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > 1_000_000
    ) {
      setError(
        "Indicá una cantidad entre 1 y 1.000.000."
      );
      return;
    }

    const phoneTrimmed =
      contactPhone.trim();

  const phoneDigits = phoneTrimmed.replace(
      /\D/g,
      ""
    );

    if (phoneDigits.length < 7) {
      setError(
        "Indicá un teléfono de contacto con al menos 7 dígitos."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append(
        "description",
        description
      );

      formData.append(
        "quantity",
        String(qty)
      );

      formData.append(
        "widthMm",
        String(width)
      );

      formData.append(
        "heightMm",
        String(height)
      );

      formData.append(
        "contactPhone",
        phoneTrimmed
      );

      for (const file of imageFiles) {
        formData.append(
          "images",
          file
        );
      }

      await createQuoteRequest(
        formData
      );

      setDescription("");
      setQuantity(1);
      setWidthMm("");
      setHeightMm("");
      setContactPhone(
        user?.phone || ""
      );
      contactPrefilled.current = true;
      setImageFiles([]);
      previewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      setPreviewUrls([]);

      setSuccess(
        "Solicitud enviada. Te avisaremos por acá cuando tengamos el precio."
      );

      await loadQuotes();
    } catch (submitError) {
      setError(
        submitError.response?.data
          ?.message ||
          "No se pudo enviar la solicitud."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (quoteId) => {
    try {
      setActionId(quoteId);
      setError("");

      const response =
        await acceptQuote(quoteId);

      const sessionId =
        response.data?.id;

      if (!sessionId) {
        throw new Error(
          "No se pudo iniciar el pago."
        );
      }

      navigate(
        `/checkout?quoteSession=${sessionId}`
      );
    } catch (acceptError) {
      setError(
        acceptError.response?.data
          ?.message ||
          acceptError.message ||
          "No se pudo aceptar la cotización."
      );
    } finally {
      setActionId(null);
    }
  };

  const openRejectConfirm = (quoteId) => {
    const quoteItem = quotes.find(
      (item) => item.id === quoteId
    );

    const message =
      quoteItem?.status === "ACCEPTED"
        ? "Se cancela el pago en curso y se cierra la solicitud. Esta acción no se puede deshacer."
        : "Se cerrará la solicitud y no podrás recuperarla.";

    setRejectConfirm({
      quoteId,
      message,
    });
  };

  const closeRejectConfirm = () => {
    setRejectConfirm(null);
  };

  const confirmReject = async () => {
    if (!rejectConfirm?.quoteId) {
      return;
    }

    const quoteId = rejectConfirm.quoteId;
    setRejectConfirm(null);

    try {
      setActionId(quoteId);
      setError("");

      await rejectQuote(quoteId);

      setSuccess(
        "Cotización rechazada."
      );

      await loadQuotes();
    } catch (rejectError) {
      setError(
        rejectError.response?.data
          ?.message ||
          "No se pudo rechazar."
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <section className="min-h-screen overflow-x-hidden bg-zinc-950 px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="mb-2 text-3xl font-black text-white sm:text-4xl">
          Cotizar producto
        </h1>

        <p className="mb-8 text-sm text-zinc-400 sm:text-base">
          Tamaño ({QUOTE_MIN_MM}–{QUOTE_MAX_MM} mm),{" "}
          {QUOTE_MIN_IMAGES}–{QUOTE_MAX_IMAGES} imágenes, cantidad y teléfono de
          contacto.
        </p>

        <div
          className={
            isCustomer
              ? "grid gap-8 lg:grid-cols-2 lg:items-start"
              : ""
          }
        >
          <div className="min-w-0">
        {!hasAuth && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
            <p className="text-sm text-amber-100 sm:text-base">
              Para enviar una cotización tenés que
              {" "}
              <Link
                to="/login?next=/cotizar"
                className="font-semibold text-white underline"
              >
                iniciar sesión
              </Link>
              {" "}
              o
              {" "}
              <Link
                to="/register?next=/cotizar"
                className="font-semibold text-white underline"
              >
                registrarte
              </Link>
              {" "}
              con una cuenta de cliente.
            </p>
          </div>
        )}

        {hasAuth && isStaff && (
          <div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">
            <p className="text-sm text-blue-100 sm:text-base">
              Entraste como administrador. Los clientes envían cotizaciones
              desde su cuenta; vos las revisás en{" "}
              <Link
                to="/admin/quotes"
                className="font-semibold text-white underline"
              >
                Cotizaciones del panel
              </Link>
              .
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-7"
        >
          <p className="font-bold text-white">
            Imágenes de ejemplo
            <span className="text-red-500"> *</span>
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Hasta {QUOTE_MAX_IMAGES} fotos.{" "}
            <span className="text-zinc-400">
              {imageFiles.length}/{QUOTE_MAX_IMAGES}{" "}
              seleccionadas
            </span>
          </p>

          <label
            className={`mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-950 px-4 py-8 transition sm:px-6 sm:py-10 ${
              canSubmit &&
              !compressingImages &&
              imageFiles.length < QUOTE_MAX_IMAGES
                ? "cursor-pointer hover:border-red-500/50"
                : "cursor-not-allowed opacity-50"
            }`}
          >
            {compressingImages ? (
              <Loader2
                className="animate-spin text-zinc-400"
                size={32}
              />
            ) : (
              <ImagePlus
                className="text-zinc-500"
                size={32}
              />
            )}

            <span className="mt-2 text-sm text-zinc-400">
              {compressingImages
                ? "Optimizando fotos..."
                : imageFiles.length > 0
                  ? `${imageFiles.length} imagen${imageFiles.length > 1 ? "es" : ""} seleccionada${imageFiles.length > 1 ? "s" : ""}`
                  : "Elegir imágenes"}
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              disabled={
                !canSubmit ||
                compressingImages ||
                imageFiles.length >=
                  QUOTE_MAX_IMAGES
              }
              className="hidden"
            />
          </label>

          {previewUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {previewUrls.map((url, index) => (
                <div
                  key={url}
                  className="relative overflow-hidden rounded-lg border border-zinc-800"
                >
                  <img
                    src={url}
                    alt={`Vista previa ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                  {canSubmit && (
                    <button
                      type="button"
                      onClick={() =>
                        removeImageAt(index)
                      }
                      className="absolute right-1 top-1 rounded-md bg-black/75 p-1 text-white hover:bg-red-600"
                      aria-label={`Quitar imagen ${index + 1}`}
                    >
                      <X size={14} />
                    </button>
                  )}
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          <datalist id={QUOTE_MM_DATALIST_ID}>
            {QUOTE_MM_VALUES.map((mm) => (
              <option key={mm} value={String(mm)} />
            ))}
          </datalist>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-center sm:p-5">
              <p className="text-base font-bold text-white">
                Tamaño (mm)
                <span className="text-red-500"> *</span>
              </p>
              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                {QUOTE_MIN_MM}–{QUOTE_MAX_MM} por lado · elegí del listado o escribí
              </p>
              <div className="mt-4 flex w-full min-w-0 flex-wrap items-center justify-center gap-2 sm:gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  list={QUOTE_MM_DATALIST_ID}
                  value={widthMm}
                  onChange={(event) =>
                    setWidthMm(
                      parseDigits(
                        event.target.value,
                        3
                      )
                    )
                  }
                  disabled={!canSubmit}
                  placeholder="25"
                  aria-label="Ancho en milímetros"
                  className="h-11 w-[4.75rem] shrink-0 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-center text-base font-semibold tabular-nums text-white focus:border-red-500 focus:outline-none disabled:opacity-50 sm:w-20"
                />

                <span
                  className="shrink-0 text-lg font-bold text-zinc-400"
                  aria-hidden
                >
                  *
                </span>

                <input
                  type="text"
                  inputMode="numeric"
                  list={QUOTE_MM_DATALIST_ID}
                  value={heightMm}
                  onChange={(event) =>
                    setHeightMm(
                      parseDigits(
                        event.target.value,
                        3
                      )
                    )
                  }
                  disabled={!canSubmit}
                  placeholder="25"
                  aria-label="Alto en milímetros"
                  className="h-11 w-[4.75rem] shrink-0 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-center text-base font-semibold tabular-nums text-white focus:border-red-500 focus:outline-none disabled:opacity-50 sm:w-20"
                />

              </div>
              <p className="mt-2 text-xs text-zinc-500">
                mm (ancho × alto)
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
              <p className="text-base font-bold text-white">
                Cantidad
                <span className="text-red-500"> *</span>
              </p>
              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                Unidades a imprimir
              </p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={quantity}
                onChange={(event) => {
                  const digits = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 7);

                  setQuantity(
                    digits === "" ? "" : digits
                  );
                }}
                disabled={!canSubmit}
                placeholder="1"
                aria-label="Cantidad"
                className="mt-4 h-12 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-center text-base font-semibold tabular-nums text-white focus:border-red-500 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <p className="mt-6 font-bold text-white">
            Teléfono de contacto
            <span className="text-red-500"> *</span>
          </p>

          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={contactPhone}
            onChange={(event) =>
              setContactPhone(
                event.target.value
              )
            }
            disabled={!canSubmit}
            placeholder="09X XXX XXX"
            aria-label="Teléfono de contacto"
            className="mt-2 h-12 w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-base text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none disabled:opacity-50"
          />

          <p className="mt-6 font-bold text-white">
            Detalles adicionales
            <span className="ml-1 text-sm font-normal text-zinc-500">
              (opcional)
            </span>
          </p>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            disabled={!canSubmit}
            rows={3}
            maxLength={1000}
            placeholder="Color, material, urgencia..."
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none disabled:opacity-50"
          />

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

          <button
            type="submit"
            disabled={
              !canSubmit ||
              submitting ||
              compressingImages
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && (
              <Loader2
                className="animate-spin"
                size={18}
              />
            )}
            {submitting
              ? "Enviando solicitud..."
              : canSubmit
              ? "Enviar a cotizar"
              : isStaff
                ? "Solo clientes pueden enviar"
                : "Registrate para enviar"}
          </button>
        </form>
          </div>

        {isCustomer && (
          <div className="min-w-0 lg:sticky lg:top-24">
            <h2 className="mb-4 text-xl font-black text-white sm:text-2xl">
              Mis cotizaciones
            </h2>

            {quotesLoadError && (
              <p className="mb-3 text-sm text-red-400">
                {quotesLoadError}
              </p>
            )}

            {loadingQuotes ? (
              <p className="text-zinc-500">
                Cargando...
              </p>
            ) : quotes.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-500">
                {quotesLoadError
                  ? "Reintentá en unos segundos."
                  : "Todavía no tenés solicitudes."}
              </div>
            ) : (
              <ul className="max-h-none space-y-3 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-1">
                {quotes.map((quote) => (
                  <li
                    key={quote.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {getQuoteCoverImage(
                        quote
                      ) && (
                        <img
                          src={getQuoteCoverImage(
                            quote
                          )}
                          alt=""
                          className="h-16 w-16 shrink-0 rounded-lg object-cover sm:h-20 sm:w-20"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getQuoteStatusStyle(
                              quote.status
                            )}`}
                          >
                            {STATUS_LABELS[
                              quote.status
                            ] || quote.status}
                          </span>

                          {quote.createdAt && (
                            <span className="text-sm text-zinc-500">
                              {formatQuoteDate(
                                quote.createdAt
                              )}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm font-bold leading-snug text-white sm:text-base">
                          {formatQuoteMeasurement(
                            quote.widthMm,
                            quote.heightMm
                          )}
                          {" · "}
                          {quote.quantity} u.
                        </p>

                        {quote.quotedPrice !=
                          null &&
                          (quote.status ===
                            "QUOTED" ||
                            quote.status ===
                              "ACCEPTED" ||
                            quote.status ===
                              "PAID") && (
                            <p className="mt-2 text-lg font-black text-red-400">
                              {formatPrice(
                                quote.quotedPrice
                              )}
                            </p>
                          )}

                        {quote.description?.trim() && (
                          <p className="mt-2 text-sm text-zinc-400">
                            {quote.description}
                          </p>
                        )}

                        {quote.adminMessage && (
                          <p className="mt-2 text-sm text-zinc-400">
                            <span className="text-zinc-500">
                              Equipo:{" "}
                            </span>
                            {quote.adminMessage}
                          </p>
                        )}

                        {quote.status ===
                          "QUOTED" && (
                          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            <button
                              type="button"
                              onClick={() =>
                                handleAccept(
                                  quote.id
                                )
                              }
                              disabled={
                                actionId ===
                                quote.id
                              }
                              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 sm:w-auto sm:px-4"
                            >
                              <CheckCircle2 size={16} />
                              Aceptar y pagar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openRejectConfirm(
                                  quote.id
                                )
                              }
                              disabled={
                                actionId ===
                                quote.id
                              }
                              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-600 px-3 py-2 text-sm font-semibold text-zinc-300 hover:border-red-500 hover:text-red-400 disabled:opacity-50 sm:w-auto sm:px-4"
                            >
                              <XCircle size={16} />
                              Rechazar
                            </button>
                          </div>
                        )}

                        {quote.status ===
                          "ACCEPTED" &&
                          quote.checkoutSession
                            ?.id && (
                          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/checkout?quoteSession=${quote.checkoutSession.id}`
                                )
                              }
                              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 sm:w-auto sm:px-4"
                            >
                              Continuar pago
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openRejectConfirm(
                                  quote.id
                                )
                              }
                              disabled={
                                actionId ===
                                quote.id
                              }
                              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-600 px-3 py-2 text-sm font-semibold text-zinc-300 hover:border-red-500 hover:text-red-400 disabled:opacity-50 sm:w-auto sm:px-4"
                            >
                              <XCircle size={16} />
                              Rechazar
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
        )}
        </div>
      </div>

      {rejectConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-quote-title"
          onClick={closeRejectConfirm}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <h3
              id="reject-quote-title"
              className="text-xl font-bold text-white"
            >
              ¿Rechazar cotización?
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {rejectConfirm.message}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRejectConfirm}
                className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmReject}
                disabled={
                  actionId ===
                  rejectConfirm.quoteId
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {actionId ===
                rejectConfirm.quoteId ? (
                  <Loader2
                    className="animate-spin"
                    size={16}
                  />
                ) : (
                  <XCircle size={16} />
                )}
                Sí, rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}