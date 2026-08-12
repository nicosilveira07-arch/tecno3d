import { Router } from "express";

import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
} from "../controllers/product.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";


const router = Router();


// Obtener todos los productos
// Público
router.get(
  "/",
  getProductsController
);


// Obtener producto por ID
// Público
router.get(
  "/:id",
  getProductByIdController
);


// Crear producto
// MODERATOR (EMPLOYEE) y ADMIN
router.post(
  "/",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  createProductController
);


// Actualizar producto
// MODERATOR (EMPLOYEE) y ADMIN
router.put(
  "/:id",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  updateProductController
);


// Eliminar producto
// Solo ADMIN
router.delete(
  "/:id",
  authenticate,
  allowRoles("ADMIN"),
  deleteProductController
);


export default router;