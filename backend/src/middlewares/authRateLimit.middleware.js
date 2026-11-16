import rateLimit, {
  ipKeyGenerator,
} from "express-rate-limit";

export const registerRateLimit = rateLimit({

  windowMs: 15 * 60 * 1000,

  limit: 8,

  standardHeaders: true,

  legacyHeaders: false,

  keyGenerator: (req) => {
    return ipKeyGenerator(req.ip);
  },

  message: {
    success: false,
    message:
      "Demasiados intentos de registro. Intenta nuevamente más tarde.",
  },

});

export const googleLoginRateLimit = rateLimit({

  windowMs: 15 * 60 * 1000,

  limit: 30,

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