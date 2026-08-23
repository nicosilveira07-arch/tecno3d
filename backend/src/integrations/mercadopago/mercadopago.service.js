import { Preference } from "mercadopago";

import client from "./mercadopago.client.js";

const preference = new Preference(client);

export async function createMercadoPagoPreference(data) {
  const notificationUrl =
    "https://esther-unentomological-maison.ngrok-free.dev/api/webhook/mercadopago";

  const body = {
    items: data.items,

    back_urls: {
      success:
        "https://c70pcrc5-5173.brs.devtunnels.ms/payment/success",

      failure:
        "https://c70pcrc5-5173.brs.devtunnels.ms/payment/failure",

      pending:
        "https://c70pcrc5-5173.brs.devtunnels.ms/payment/pending",
    },

    auto_return: "approved",

    notification_url: notificationUrl,

    external_reference: data.orderId,
  };

  console.log("==========================================");
  console.log("CREANDO PREFERENCE MERCADO PAGO");
  console.log("NOTIFICATION URL:");
  console.log(notificationUrl);
  console.log("==========================================");

  console.log(
    "PREFERENCE BODY:",
    JSON.stringify(body, null, 2)
  );

  const response = await preference.create({
    body,
  });

  console.log("==========================================");
  console.log("PREFERENCE CREADA");
  console.log("ID:", response.id);
  console.log("NOTIFICATION_URL DEVUELTA:", response.notification_url);
  console.log("COLLECTOR ID:", response.collector_id);
  console.log("CLIENT ID:", response.client_id);
  console.log("EXTERNAL REFERENCE:", response.external_reference);
  console.log("==========================================");

  return response;
}