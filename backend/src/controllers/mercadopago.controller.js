import {
  createOrderPaymentService,
} from "../services/mercadopago.service.js";


export async function createOrderPaymentController(req, res) {

  try {

    const result =
      await createOrderPaymentService(
        req.params.orderId
      );


    return res.json({
      success: true,
      data: result,
    });


  } catch (error) {

    console.error(
      "ERROR MERCADO PAGO:"
    );

    console.error(error);

    console.error(
      "MESSAGE:",
      error.message
    );

    console.error(
      "CAUSE:",
      error.cause
    );


    return res.status(400).json({
      success: false,
      message: error.message,
      cause: error.cause,
    });

  }

}