const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Error de validación.",
      errors: err.issues.map(
        (error) => error.message
      ),
    });
  }

  // Pedido pendiente con productos eliminados/inválidos.
  // Es un conflicto de datos/estado, no un error interno del servidor.
  if (
    err.message ===
    "Uno o más productos de este pedido ya no están disponibles."
  ) {
    return res.status(409).json({
      success: false,
      message: err.message,
    });
  }

  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Cada imagen puede pesar hasta 6 MB después de optimizar."
        : err.code === "LIMIT_FILE_COUNT"
          ? "Superaste la cantidad máxima de imágenes."
          : "No se pudieron procesar las imágenes.";

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (
    typeof err.message === "string" &&
    err.message.length > 0 &&
  !err.message.includes("Invalid `prisma")
  ) {
    const clientError =
      err.message === "Solo se permiten archivos de imagen." ||
      err.message.includes("Debés adjuntar") ||
      err.message.includes("milímetros") ||
      err.message.includes("cantidad") ||
      err.message.includes("contacto") ||
      err.message.includes("teléfono") ||
      err.message.includes("imagen") ||
      err.message.includes("detalles");

    if (clientError) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }

  return res.status(500).json({
    success: false,
    message: "Error interno del servidor.",
  });
};

export default errorMiddleware;