const QUOTE_PRINT_MAX_CM = 25;

const QUOTE_MEASUREMENT_GROUPS = [
  {
    id: "square",
    title: "Medidas cuadradas",
    subtitle:
      "Hasta 25 × 25 cm (máximo de la impresora)",
    options: [
      { width: 5, height: 5, label: "5 × 5 cm" },
      { width: 10, height: 10, label: "10 × 10 cm" },
      { width: 15, height: 15, label: "15 × 15 cm" },
      { width: 20, height: 20, label: "20 × 20 cm" },
      { width: 25, height: 25, label: "25 × 25 cm" },
    ],
  },
  {
    id: "rectangle",
    title: "Medidas rectangulares",
    subtitle:
      "Ancho y alto no superan 25 cm",
    options: [
      { width: 25, height: 5, label: "25 × 5 cm" },
      { width: 25, height: 10, label: "25 × 10 cm" },
      { width: 25, height: 15, label: "25 × 15 cm" },
      { width: 25, height: 20, label: "25 × 20 cm" },
      { width: 5, height: 25, label: "5 × 25 cm" },
      { width: 10, height: 25, label: "10 × 25 cm" },
      { width: 15, height: 25, label: "15 × 25 cm" },
      { width: 20, height: 25, label: "20 × 25 cm" },
      { width: 20, height: 10, label: "20 × 10 cm" },
      { width: 20, height: 15, label: "20 × 15 cm" },
      { width: 10, height: 20, label: "10 × 20 cm" },
      { width: 15, height: 20, label: "15 × 20 cm" },
      { width: 15, height: 10, label: "15 × 10 cm" },
      { width: 10, height: 15, label: "10 × 15 cm" },
      { width: 10, height: 5, label: "10 × 5 cm" },
      { width: 5, height: 10, label: "5 × 10 cm" },
    ],
  },
];

const ALLOWED_MEASUREMENTS =
  QUOTE_MEASUREMENT_GROUPS.flatMap(
    (group) => group.options
  );

const parseAndValidateMeasurement = (
  widthCm,
  heightCm
) => {
  const width = Number(widthCm);
  const height = Number(heightCm);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    throw new Error(
      "Seleccioná las medidas de impresión."
    );
  }

  const match = ALLOWED_MEASUREMENTS.find(
    (option) =>
      option.width === width &&
      option.height === height
  );

  if (!match) {
    throw new Error(
      "La medida seleccionada no es válida. El máximo de impresión es 25 × 25 cm."
    );
  }

  if (
    width > QUOTE_PRINT_MAX_CM ||
    height > QUOTE_PRINT_MAX_CM
  ) {
    throw new Error(
      "Las medidas no pueden superar 25 × 25 cm."
    );
  }

  return match;
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

const formatQuoteMeasurement = (
  widthCm,
  heightCm
) => {
  const width = Number(widthCm);
  const height = Number(heightCm);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    return "—";
  }

  return `${width} × ${height} cm`;
};

export {
  QUOTE_PRINT_MAX_CM,
  QUOTE_MEASUREMENT_GROUPS,
  ALLOWED_MEASUREMENTS,
  parseAndValidateMeasurement,
  validateQuoteQuantity,
  formatQuoteMeasurement,
};