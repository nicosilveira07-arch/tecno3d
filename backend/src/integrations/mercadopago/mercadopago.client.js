import { MercadoPagoConfig } from "mercadopago";


const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});


export default client;