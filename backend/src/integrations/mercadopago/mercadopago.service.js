import { Preference } from "mercadopago";

import client from "./mercadopago.client.js";

const preference = new Preference(client);

export async function createMercadoPagoPreference(data) {
  const notificationUrl =
    "https://api.tecno3d.net/api/webhook/mercadopago";
  const body = {
    items: data.items,

    back_urls: {
      success:
        "https://www.tecno3d.net/payment/success",

      failure:
        "https://www.tecno3d.net/payment/failure",

      pending:
        "https://www.tecno3d.net/payment/pending",
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

