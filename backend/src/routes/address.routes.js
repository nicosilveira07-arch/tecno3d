import { Router } from "express";

import {
  getUserAddressesController,
  getAddressByIdController,
  createAddressController,
  updateAddressController,
  deleteAddressController,
} from "../controllers/address.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";


const router = Router();


router.use(authenticate);


router.get(
  "/",
  getUserAddressesController
);


router.get(
  "/:id",
  getAddressByIdController
);


router.post(
  "/",
  createAddressController
);


router.put(
  "/:id",
  updateAddressController
);


router.delete(
  "/:id",
  deleteAddressController
);


export default router;