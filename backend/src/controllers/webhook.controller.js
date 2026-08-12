import {
  processMercadoPagoWebhookService,
} from "../services/webhook.service.js";


export async function mercadoPagoWebhookController(req, res) {
  try {

    await processMercadoPagoWebhookService(
      req.body
    );


    return res.sendStatus(200);


  } catch (error) {

    console.error(
      "Webhook Mercado Pago:",
      error.message
    );


    return res.sendStatus(400);

  }
}