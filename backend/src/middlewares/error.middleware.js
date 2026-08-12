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


  return res.status(500).json({
    success: false,
    message: err.message || "Error interno del servidor.",
  });

};


export default errorMiddleware;