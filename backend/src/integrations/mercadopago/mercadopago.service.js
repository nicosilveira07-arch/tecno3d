import { Preference } from "mercadopago";

import client from "./mercadopago.client.js";

const preference = new Preference(client);

export async function createMercadoPagoPreference(data) {
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

    notification_url:
      "https://esther-unentomological-maison.ngrok-free.dev/api/mercadopago/webhook",

    external_reference: data.orderId,
  };

  console.log(
    "PREFERENCE BODY:",
    JSON.stringify(body, null, 2)
  );

  const response = await preference.create({
    body,
  });

  console.log(
    "PREFERENCE RESPONSE:",
    JSON.stringify(response, null, 2)
  );

  return response;
}

