import { Router } from "express";

import {
  uploadImageController,
} from "../controllers/upload.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  upload.array("images", 10),
  uploadImageController
);

export default router;

