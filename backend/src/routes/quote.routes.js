import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";

import {
  createQuoteRequestController,
  listMyQuotesController,
  getMyQuoteController,
  rejectQuoteController,
  acceptQuoteController,
  listQuotesAdminController,
  getQuoteAdminSummaryController,
  sendQuotePriceController,
} from "../controllers/quote.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  allowRoles("CUSTOMER"),
  upload.array("images", 5),
  createQuoteRequestController
);

router.get(
  "/mine",
  authenticate,
  allowRoles("CUSTOMER"),
  listMyQuotesController
);

router.get(
  "/mine/:id",
  authenticate,
  allowRoles("CUSTOMER"),
  getMyQuoteController
);

router.post(
  "/:id/reject",
  authenticate,
  allowRoles("CUSTOMER"),
  rejectQuoteController
);

router.post(
  "/:id/accept",
  authenticate,
  allowRoles("CUSTOMER"),
  acceptQuoteController
);

router.get(
  "/admin/summary",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  getQuoteAdminSummaryController
);

router.get(
  "/admin",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  listQuotesAdminController
);

router.patch(
  "/admin/:id",
  authenticate,
  allowRoles("ADMIN", "EMPLOYEE"),
  sendQuotePriceController
);

export default router;