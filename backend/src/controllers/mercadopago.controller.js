import {
  createOrderPaymentService,
} from "../services/mercadopago.service.js";

import {
  processMercadoPagoWebhookService,
} from "../services/webhook.service.js";


export async function createOrderPaymentController(req, res) {
  try {
    const result = await createOrderPaymentService(
      req.params.orderId
    );

    return res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("ERROR MERCADO PAGO:");
    console.error(error);
    console.error("MESSAGE:", error.message);
    console.error("CAUSE:", error.cause);

    return res.status(400).json({
      success: false,
      message: error.message,
      cause: error.cause,
    });
  }
}


export async function webhookMercadoPagoController(req, res) {

  console.log(
    "QUERY:",
    JSON.stringify(req.query, null, 2)
  );

  console.log(
    "BODY:",
    JSON.stringify(req.body, null, 2)
  );


  const topic =
    req.query?.topic ||
    req.body?.topic;


  const paymentId =
    req.body?.data?.id ||
    req.query?.id;


  /*
   * Respondemos inmediatamente a Mercado Pago
   */
  res.status(200).json({
    received: true,
  });


  /*
   * merchant_order
   */
  if (topic === "merchant_order") {

    console.log(
      "Webhook merchant_order recibido."
    );

    try {

      await processMercadoPagoWebhookService({
        topic: "merchant_order",
        data: {
          id: req.query?.id,
        },
      });

      console.log(
        "Merchant order procesado correctamente"
      );

    } catch (error) {

      console.error(
        "ERROR PROCESANDO MERCHANT ORDER:",
        error.message
      );
    }

    return;
  }


  /*
   * payment
   */
  if (!paymentId) {

    console.log(
      "Webhook sin paymentId"
    );

    return;
  }


  console.log(
    "PAYMENT ID RECIBIDO:",
    paymentId
  );


  try {

    await processMercadoPagoWebhookService({
      data: {
        id: paymentId,
      },
    });

    console.log(
      "Webhook procesado correctamente"
    );

  } catch (error) {

    console.error(
      "ERROR PROCESANDO WEBHOOK:",
      error.message
    );
  }
}