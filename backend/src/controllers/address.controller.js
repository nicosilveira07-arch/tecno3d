import {
  getUserAddressesService,
  getAddressByIdService,
  createAddressService,
  updateAddressService,
  deleteAddressService,
} from "../services/address.service.js";

import {
  addressSchema,
  updateAddressSchema,
} from "../validators/address.validator.js";


export async function getUserAddressesController(req, res) {
  try {
    const addresses = await getUserAddressesService(req.user.id);

    return res.json({
      success: true,
      data: addresses,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


export async function getAddressByIdController(req, res) {
  try {
    const address = await getAddressByIdService(req.params.id);

    return res.json({
      success: true,
      data: address,
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}


export async function createAddressController(req, res) {
  try {
    const data = addressSchema.parse(req.body);

    const address = await createAddressService(
      req.user.id,
      data
    );

    return res.status(201).json({
      success: true,
      message: "Dirección creada correctamente.",
      data: address,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


export async function updateAddressController(req, res) {
  try {
    const data = updateAddressSchema.parse(req.body);

    const address = await updateAddressService(
      req.params.id,
      req.user.id,
      data
    );

    return res.json({
      success: true,
      message: "Dirección actualizada correctamente.",
      data: address,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


export async function deleteAddressController(req, res) {
  try {
    await deleteAddressService(
      req.params.id,
      req.user.id
    );

    return res.json({
      success: true,
      message: "Dirección eliminada correctamente.",
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}