import rateLimit, {
  ipKeyGenerator,
} from "express-rate-limit";

export const loginRateLimit = rateLimit({

  windowMs: 15 * 60 * 1000,

  limit: 10,

  standardHeaders: true,

  legacyHeaders: false,

  keyGenerator: (req) => {
    return ipKeyGenerator(req.ip);
  },

  message: {
    success: false,
    message:
      "Demasiados intentos de inicio de sesión. Intenta nuevamente más tarde.",
  },

});