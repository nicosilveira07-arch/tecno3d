export const QUOTE_MIN_MM = 1;
export const QUOTE_MAX_MM = 250;

/** Valores permitidos para datalist / sugerencias (1–250). */
export const QUOTE_MM_VALUES = Array.from(
  { length: QUOTE_MAX_MM - QUOTE_MIN_MM + 1 },
  (_, index) => QUOTE_MIN_MM + index
);

export const QUOTE_MM_DATALIST_ID = "quote-mm-datalist";
export const QUOTE_MIN_IMAGES = 1;
export const QUOTE_MAX_IMAGES = 5;

export function formatQuoteMeasurement(
  widthMm,
  heightMm
) {
  const width = Number(widthMm);
  const height = Number(heightMm);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    return "—";
  }

  return `${width} × ${height} mm`;
}

export function getQuoteCoverImage(quote) {
  if (quote?.images?.length) {
    return quote.images[0].imageUrl;
  }

  return quote?.imageUrl || null;
}

export function getQuoteImagesList(quote) {
  if (quote?.images?.length) {
    return quote.images;
  }

  const cover = getQuoteCoverImage(quote);

  if (cover) {
    return [{ imageUrl: cover }];
  }

  return [];
}

export function quoteImageThumbUrl(
  imageUrl,
  width = 240
) {
  if (
    !imageUrl ||
    !imageUrl.includes("res.cloudinary.com") ||
    !imageUrl.includes("/upload/")
  ) {
    return imageUrl;
  }

  return imageUrl.replace(
    "/upload/",
    `/upload/w_${width},q_auto,f_auto/`
  );
}

/** Vista grande (pantalla / impresión). */
export function quoteImageLargeUrl(imageUrl) {
  if (
    !imageUrl ||
    !imageUrl.includes("res.cloudinary.com") ||
    !imageUrl.includes("/upload/")
  ) {
    return imageUrl;
  }

  if (imageUrl.includes("/upload/w_")) {
    return imageUrl;
  }

  return imageUrl.replace(
    "/upload/",
    "/upload/w_2000,q_auto,f_auto/"
  );
}

/** Enlace que suele forzar descarga en Cloudinary. */
export function quoteImageDownloadUrl(
  imageUrl,
  filenameBase = "referencia"
) {
  if (
    !imageUrl ||
    !imageUrl.includes("res.cloudinary.com") ||
    !imageUrl.includes("/upload/")
  ) {
    return imageUrl;
  }

  const safeName = filenameBase.replace(
    /[^\w-]+/g,
    "_"
  );

  return imageUrl.replace(
    "/upload/",
    `/upload/fl_attachment:${safeName}/`
  );
}