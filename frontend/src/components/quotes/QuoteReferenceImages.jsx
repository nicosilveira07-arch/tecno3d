import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Images,
  X,
} from "lucide-react";

import {
  QUOTE_MAX_IMAGES,
  formatQuoteMeasurement,
  getQuoteImagesList,
  quoteImageDownloadUrl,
  quoteImageLargeUrl,
  quoteImageThumbUrl,
} from "@/features/quotes/quoteSpecs";

function ThumbButton({
  image,
  index,
  selected,
  onSelect,
  size,
}) {
  const isMobile = size === "mobile";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative shrink-0 overflow-hidden rounded-xl border-2 bg-zinc-900 transition ${
        isMobile ? "h-14 w-14" : "h-20 w-20"
      } ${
        selected
          ? "border-red-600"
          : "border-zinc-800 hover:border-zinc-600"
      }`}
    >
      <img
        src={quoteImageThumbUrl(
          image.imageUrl,
          isMobile ? 120 : 200
        )}
        alt={`Referencia ${index + 1}`}
        className="h-full w-full object-cover"
      />
    </button>
  );
}

function QuotePhotoBook({
  quote,
  images,
  onClose,
}) {
  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const quoteTag = quote?.id
    ? quote.id.slice(-6).toUpperCase()
    : "ref";

  const shortId = quoteTag;

  const goPrev = useCallback(() => {
    setSelectedIndex(
      (index) =>
        (index - 1 + images.length) %
        images.length
    );
  }, [images.length]);

  const goNext = useCallback(() => {
    setSelectedIndex(
      (index) => (index + 1) % images.length
    );
  }, [images.length]);

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft") {
        goPrev();
      }

      if (event.key === "ArrowRight") {
        goNext();
      }
    };

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [onClose, goPrev, goNext]);

  const active = images[selectedIndex];

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-zinc-950"
      role="dialog"
      aria-modal="true"
      aria-label="Book de fotos de cotización"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-white">
            Book de fotos · #{shortId}
          </p>
          <p className="truncate text-sm text-zinc-400">
            {formatQuoteMeasurement(
              quote.widthMm,
              quote.heightMm
            )}
            {" · "}
            {quote.quantity ?? "—"} u.
            {quote.user
              ? ` · ${quote.user.firstName} ${quote.user.lastName}`
              : ""}
            {quote.contactPhone
              ? ` · ${quote.contactPhone}`
              : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full border border-zinc-700 bg-zinc-900 p-2 text-white hover:border-red-500"
          aria-label="Cerrar"
        >
          <X size={22} />
        </button>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex min-h-0 min-w-0 flex-1 gap-2 sm:gap-4">
          {images.length > 1 && (
            <div className="hidden w-20 shrink-0 flex-col gap-3 overflow-y-auto sm:flex [&::-webkit-scrollbar]:hidden">
              {images.map((image, index) => (
                <ThumbButton
                  key={
                    image.id ||
                    `${quote.id}-thumb-${index}`
                  }
                  image={image}
                  index={index}
                  selected={selectedIndex === index}
                  onSelect={() =>
                    setSelectedIndex(index)
                  }
                  size="desktop"
                />
              ))}
            </div>
          )}

          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              <img
                key={active.imageUrl}
                src={quoteImageLargeUrl(
                  active.imageUrl
                )}
                alt={`Referencia ${selectedIndex + 1}`}
                className="absolute inset-0 m-auto block h-full w-full object-contain p-1 sm:p-6"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-black/70 text-white hover:border-red-600 sm:left-4 sm:h-11 sm:w-11"
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-black/70 text-white hover:border-red-600 sm:right-4 sm:h-11 sm:w-11"
                    aria-label="Siguiente"
                  >
                    <ChevronRight size={22} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white sm:bottom-4">
                    {selectedIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex shrink-0 flex-wrap justify-center gap-2 pb-1 sm:hidden">
                {images.map((image, index) => (
                  <ThumbButton
                    key={
                      image.id ||
                      `${quote.id}-m-${index}`
                    }
                    image={image}
                    index={index}
                    selected={selectedIndex === index}
                    onSelect={() =>
                      setSelectedIndex(index)
                    }
                    size="mobile"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex shrink-0 justify-center sm:mt-4 sm:justify-start">
          <a
            href={quoteImageDownloadUrl(
              active.imageUrl,
              `cotizacion-${quoteTag}-${selectedIndex + 1}`
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500"
          >
            <Download size={16} />
            Descargar esta foto
          </a>
        </div>
      </div>
    </div>
  );
}

export default function QuoteReferenceImages({
  quote,
}) {
  const images = getQuoteImagesList(quote);
  const [bookOpen, setBookOpen] = useState(false);

  if (images.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Sin imágenes de referencia.
      </p>
    );
  }

  const cover = images[0];
  const extraCount = images.length - 1;

  return (
    <>
      <div className="flex shrink-0 flex-col gap-2">
        <button
          type="button"
          onClick={() => setBookOpen(true)}
          className="group relative overflow-hidden rounded-xl border-2 border-zinc-800 bg-zinc-950 transition hover:border-red-500/60"
          aria-label={`Ver book de fotos, ${images.length} imágenes`}
        >
          <img
            src={quoteImageThumbUrl(
              cover.imageUrl,
              280
            )}
            alt="Primera referencia"
            className="h-24 w-24 object-cover sm:h-28 sm:w-28"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/45">
            <span className="flex items-center gap-1 rounded-lg bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100 sm:text-xs">
              <Images size={14} />
              Abrir
            </span>
          </div>

          {extraCount > 0 && (
            <span className="absolute bottom-1.5 right-1.5 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              +{extraCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setBookOpen(true)}
          className="inline-flex max-w-[8.5rem] items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-center text-[11px] font-semibold leading-tight text-zinc-200 transition hover:border-red-500/50 hover:text-white sm:text-xs"
        >
          <Images size={14} className="shrink-0" />
          Ver book ({images.length}/{QUOTE_MAX_IMAGES})
        </button>
      </div>

      {bookOpen && (
        <QuotePhotoBook
          quote={quote}
          images={images}
          onClose={() => setBookOpen(false)}
        />
      )}
    </>
  );
}