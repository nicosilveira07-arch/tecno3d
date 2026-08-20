import { Router } from "express";

import {
  getStoreSettingsController,
  updateStoreSettingsController,
} from "../controllers/storeSettings.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Obtener configuración
// Público → el frontend necesita mostrarla

router.get(
  "/",
  getStoreSettingsController
);

// Actualizar configuración
// Solo ADMIN

router.put(
  "/",
  authenticate,
  allowRoles("ADMIN"),
  updateStoreSettingsController
);

export default router;