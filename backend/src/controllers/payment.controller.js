import {
  getPaymentService,
  createPaymentService,
  updatePaymentService,
} from "../services/payment.service.js";


export async function getPaymentController(req, res) {
  try {
    const payment = await getPaymentService(
      req.params.orderId
    );

    return res.json({
      success: true,
      data: payment,
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}



export async function createPaymentController(req, res) {
  try {
    const payment = await createPaymentService({
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Pago creado correctamente.",
      data: payment,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}



export async function updatePaymentController(req, res) {
  try {
    const payment = await updatePaymentService(
      req.params.id,
      req.body
    );

    return res.json({
      success: true,
      message: "Pago actualizado correctamente.",
      data: payment,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}