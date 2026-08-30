import { Router } from "express";

import { uploadImageController } from "../controllers/upload.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  upload.array("images", 10),
  uploadImageController
);

export default router;

