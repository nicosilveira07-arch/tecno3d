import { Payment, MerchantOrder } from "mercadopago";

import client from "../integrations/mercadopago/mercadopago.client.js";

import {
  findPaymentByOrderId,
  updatePayment,
} from "../repositories/payment.repository.js";

import {
  updateOrderStatus,
  getOrderById,
} from "../repositories/order.repository.js";

import {
  decreaseStock,
} from "../repositories/product.repository.js";


const paymentClient = new Payment(client);

const merchantOrderClient = new MerchantOrder(client);



export async function processMercadoPagoWebhookService(data) {

  console.log(
    "WEBHOOK MERCADO PAGO:",
    JSON.stringify(data, null, 2)
  );


  let paymentId = data?.data?.id;



  // Mercado Pago primero puede enviar merchant_order
  if (
    data?.topic === "merchant_order"
  ) {

    console.log(
      "Procesando merchant_order..."
    );


    const merchantOrder =
      await merchantOrderClient.get({
        merchantOrderId: data.data.id,
      });


    const payment =
      merchantOrder.payments?.[0];


    if (!payment) {

      throw new Error(
        "Merchant order sin payment."
      );

    }


    paymentId = payment.id;


    console.log(
      "PAYMENT ID OBTENIDO:",
      paymentId
    );

  }



  if (!paymentId) {

    throw new Error(
      "No llegó ID de pago de Mercado Pago."
    );

  }



  const paymentMP = await paymentClient.get({
    id: paymentId,
  });



  console.log(
    "ESTADO MP:",
    paymentMP.status
  );



  const orderId = paymentMP.external_reference;



  console.log(
    "ORDER ID:",
    orderId
  );



  if (!orderId) {

    throw new Error(
      "El pago no tiene orderId."
    );

  }



  const payment = await findPaymentByOrderId(
    orderId
  );
  
  console.log(
    "PAGO INTERNO ENCONTRADO:",
    JSON.stringify(payment, null, 2)
  );
  
  if (!payment) {
    throw new Error(
      "Pago interno no encontrado."
    );
  }
  
  if (
    payment.status === "PAID" &&
    payment.transactionId === String(paymentMP.id)
  ) {
    console.log(
      "WEBHOOK DUPLICADO: pago ya procesado."
    );
  
    return true;
  }
  
  let paymentStatus = "PENDING";



  if (
    paymentMP.status === "approved"
  ) {

    paymentStatus = "PAID";

  }



  if (
    paymentMP.status === "rejected" ||
    paymentMP.status === "cancelled"
  ) {

    paymentStatus = "FAILED";

  }



  await updatePayment(
    payment.id,
    {
      status: paymentStatus,
      transactionId: String(paymentMP.id),
    }
  );



  if (
    paymentMP.status === "approved"
  ) {


    console.log(
      "ACTUALIZANDO PEDIDO A CONFIRMED"
    );



    await updateOrderStatus(
      orderId,
      "CONFIRMED"
    );



    const order =
      await getOrderById(orderId);



    for (const item of order.items) {


      await decreaseStock(
        item.productId,
        item.quantity
      );


    }


  }



  return true;

}