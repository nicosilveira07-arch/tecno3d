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

  return res.status(500).json({
    success: false,
    message: "Error interno del servidor.",
  });
};

export default errorMiddleware;