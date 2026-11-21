const QUOTE_MIN_MM = 1;
const QUOTE_MAX_MM = 250;
const QUOTE_MIN_IMAGES = 1;
const QUOTE_MAX_IMAGES = 5;

const parsePositiveInt = (value) => {
  const numeric = Number(value);

  if (
    !Number.isInteger(numeric) ||
    !Number.isFinite(numeric)
  ) {
    return null;
  }

  return numeric;
};

const validatePieceSizeMm = (widthMm, heightMm) => {
  const width = parsePositiveInt(widthMm);
  const height = parsePositiveInt(heightMm);

  if (width === null || height === null) {
    throw new Error(
      "Indicá ancho y alto de la pieza en milímetros (solo números enteros)."
    );
  }

  if (
    width < QUOTE_MIN_MM ||
    height < QUOTE_MIN_MM
  ) {
    throw new Error(
      `El tamaño mínimo de la pieza es ${QUOTE_MIN_MM} × ${QUOTE_MIN_MM} mm.`
    );
  }

  if (
    width > QUOTE_MAX_MM ||
    height > QUOTE_MAX_MM
  ) {
    throw new Error(
      `El tamaño máximo de la pieza es ${QUOTE_MAX_MM} × ${QUOTE_MAX_MM} mm.`
    );
  }

  return { widthMm: width, heightMm: height };
};

const MIN_CONTACT_PHONE_DIGITS = 7;
const MAX_CONTACT_PHONE_LENGTH = 30;

const validateQuoteContactPhone = (value) => {
  if (typeof value !== "string") {
    throw new Error(
      "Indicá un número de contacto para coordinar."
    );
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(
      "Indicá un número de contacto para coordinar."
    );
  }

  const digits = trimmed.replace(/\D/g, "");

  if (digits.length < MIN_CONTACT_PHONE_DIGITS) {
    throw new Error(
      `El teléfono de contacto debe tener al menos ${MIN_CONTACT_PHONE_DIGITS} dígitos.`
    );
  }

  if (trimmed.length > MAX_CONTACT_PHONE_LENGTH) {
    throw new Error(
      "El teléfono de contacto es demasiado largo."
    );
  }

  return trimmed;
};

const validateQuoteQuantity = (quantity) => {
  const numeric = Number(quantity);

  if (
    !Number.isInteger(numeric) ||
    numeric < 1
  ) {
    throw new Error(
      "La cantidad debe ser al menos 1 unidad."
    );
  }

  if (numeric > 1_000_000) {
    throw new Error(
      "La cantidad no puede superar 1.000.000 unidades."
    );
  }

  return numeric;
};

const validateQuoteImagesCount = (count) => {
  if (
    !Number.isInteger(count) ||
    count < QUOTE_MIN_IMAGES ||
    count > QUOTE_MAX_IMAGES
  ) {
    throw new Error(
      `Debés adjuntar entre ${QUOTE_MIN_IMAGES} y ${QUOTE_MAX_IMAGES} imágenes de ejemplo.`
    );
  }
};

const formatQuoteMeasurement = (
  widthMm,
  heightMm
) => {
  const width = Number(widthMm);
  const height = Number(heightMm);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    return "—";
  }

  return `${width} × ${height} mm`;
};

export {
  QUOTE_MIN_MM,
  QUOTE_MAX_MM,
  QUOTE_MIN_IMAGES,
  QUOTE_MAX_IMAGES,
  validatePieceSizeMm,
  validateQuoteContactPhone,
  validateQuoteQuantity,
  validateQuoteImagesCount,
  formatQuoteMeasurement,
};