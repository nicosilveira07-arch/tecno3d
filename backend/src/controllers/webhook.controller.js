import crypto from "crypto";

import {
  processMercadoPagoWebhookService,
} from "../services/webhook.service.js";


export async function mercadoPagoWebhookController(req, res) {

  try {

    console.log(
      "========== WEBHOOK MERCADO PAGO =========="
    );


    // =====================================================
    // HEADERS
    // =====================================================

    const xSignature =
      req.headers["x-signature"];

    const xRequestId =
      req.headers["x-request-id"];


    // =====================================================
    // QUERY PARAMS
    // =====================================================

    const dataId =
      req.query["data.id"];

    const type =
      req.query["type"] ??
      req.body?.type ??
      req.body?.topic;


    // =====================================================
    // SECRET
    // =====================================================

    const secret =
      process.env.MERCADO_PAGO_WEBHOOK_SECRET?.trim();


    console.log(
      "X-SIGNATURE:",
      xSignature
    );

    console.log(
      "X-REQUEST-ID:",
      xRequestId
    );

    console.log(
      "TYPE:",
      type
    );

    console.log(
      "DATA.ID:",
      dataId
    );

    console.log(
      "SECRET CONFIGURADO:",
      Boolean(secret)
    );


    // =====================================================
    // VALIDACIONES BÁSICAS
    // =====================================================

    if (!secret) {

      console.error(
        "MERCADO_PAGO_WEBHOOK_SECRET NO CONFIGURADO."
      );

      return res.sendStatus(500);
    }


    if (!xSignature) {

      console.error(
        "WEBHOOK SIN X-SIGNATURE."
      );

      return res.sendStatus(400);
    }


    if (!xRequestId) {

      console.error(
        "WEBHOOK SIN X-REQUEST-ID."
      );

      return res.sendStatus(400);
    }


    // =====================================================
    // MERCHANT ORDER
    // =====================================================

    if (type === "merchant_order") {

      console.log(
        "MERCHANT_ORDER RECIBIDO - SE IGNORA."
      );

      return res.sendStatus(200);
    }


    // =====================================================
    // SOLO PAYMENT
    // =====================================================

    if (type !== "payment") {

      console.log(
        `WEBHOOK IGNORADO - TIPO: ${type}`
      );

      return res.sendStatus(200);
    }


    // =====================================================
    // PAYMENT SIN DATA.ID
    // =====================================================

    if (!dataId) {

      console.warn(
        "PAYMENT SIN data.id - SE RESPONDE 200."
      );

      return res.sendStatus(200);
    }


    // =====================================================
    // VALIDAR FIRMA MERCADO PAGO
    // =====================================================

    try {

      console.log(
        "========== VALIDANDO FIRMA HMAC =========="
      );


      // ---------------------------------------------------
      // EXTRAER timestamp Y firma desde x-signature
      // ---------------------------------------------------

      const signatureParts =
        String(xSignature)
          .split(",");

      let timestamp = null;
      let receivedSignature = null;


      for (const part of signatureParts) {

        const [key, value] =
          part.split("=");

        if (key === "ts") {

          timestamp = value;

        }

        if (key === "v1") {

          receivedSignature = value;

        }

      }


      if (!timestamp || !receivedSignature) {

        console.error(
          "X-SIGNATURE CON FORMATO INVÁLIDO."
        );

        return res.sendStatus(401);
      }


      // ---------------------------------------------------
      // MANIFEST OFICIAL
      // ---------------------------------------------------

      const manifest =
        `id:${String(dataId)};request-id:${String(xRequestId)};ts:${String(timestamp)};`;


      console.log(
        "DATA.ID UTILIZADO:",
        String(dataId)
      );

      console.log(
        "REQUEST ID UTILIZADO:",
        String(xRequestId)
      );

      console.log(
        "TIMESTAMP:",
        String(timestamp)
      );


      // ---------------------------------------------------
      // GENERAR FIRMA HMAC-SHA256
      // ---------------------------------------------------

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            String(secret)
          )
          .update(manifest)
          .digest("hex");


      // ---------------------------------------------------
      // COMPARACIÓN SEGURA
      // ---------------------------------------------------

      const receivedBuffer =
        Buffer.from(
          String(receivedSignature),
          "hex"
        );

      const generatedBuffer =
        Buffer.from(
          String(generatedSignature),
          "hex"
        );


      if (
        receivedBuffer.length !==
        generatedBuffer.length
      ) {

        console.error(
          "FIRMA MERCADO PAGO INVÁLIDA."
        );

        console.error(
          "RAZÓN: SignatureMismatch"
        );

        return res.sendStatus(401);
      }


      const signatureValid =
        crypto.timingSafeEqual(
          receivedBuffer,
          generatedBuffer
        );


      if (!signatureValid) {

        console.error(
          "FIRMA MERCADO PAGO INVÁLIDA."
        );

        console.error(
          "RAZÓN: SignatureMismatch"
        );

        return res.sendStatus(401);
      }


      console.log(
        "FIRMA MERCADO PAGO VÁLIDA."
      );


    } catch (error) {

      console.error(
        "ERROR VALIDANDO FIRMA:",
        error
      );

      return res.sendStatus(401);
    }


    // =====================================================
    // PROCESAR PAYMENT
    // =====================================================

    console.log(
      "=========================================="
    );

    console.log(
      "PROCESANDO PAYMENT"
    );

    console.log(
      "PAYMENT ID:",
      String(dataId)
    );

    console.log(
      "=========================================="
    );


    await processMercadoPagoWebhookService({

      type: "payment",

      data: {
        id: String(dataId),
      },

    });


    console.log(
      "WEBHOOK PAYMENT PROCESADO CORRECTAMENTE."
    );


    return res.sendStatus(200);


  } catch (error) {

    console.error(
      "ERROR WEBHOOK MERCADO PAGO:",
      error.message
    );

    console.error(
      error.stack
    );

    return res.sendStatus(500);
  }

}