import crypto from "crypto";

import {
  createCouponRepository,
  findCouponByCodeRepository,
  findWelcomeCouponByUserIdRepository,
} from "../repositories/coupon.repository.js";

import { sendEmail } from "./email.service.js";

const WELCOME_PERCENT = 5;
const WELCOME_VALID_DAYS = 90;

const FRONTEND_URL = "https://www.tecno3d.net";
const LOGO_URL = `${FRONTEND_URL}/logo.png`;

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const buildWelcomeCode = () => {
  const random = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();

  return `BIENVENIDA-${random}`;
};

const buildWelcomeEmailHtml = ({
  firstName,
  code,
}) => {
  const safeName = escapeHtml(
    firstName?.trim() || "cliente"
  );
  const safeCode = escapeHtml(code);
  const shopUrl = `${FRONTEND_URL}/products`;

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        >
        <title>Cupón de bienvenida - TECNO 3D</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f1f5f9;
          font-family: Arial, Helvetica, sans-serif;
          color: #111827;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width: 100%;
            background-color: #f1f5f9;
            margin: 0;
            padding: 0;
          "
        >
          <tr>
            <td
              align="center"
              style="
                padding: 32px 16px;
              "
            >
              <table
                role="presentation"
                width="600"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  width: 100%;
                  max-width: 600px;
                  background-color: #ffffff;
                  border-radius: 16px;
                  overflow: hidden;
                "
              >

                <tr>
                  <td
                    align="center"
                    style="
                      background-color: #18181b;
                      padding: 28px 24px;
                    "
                  >
                    <img
                      src="${LOGO_URL}"
                      alt="TECNO 3D"
                      width="170"
                      style="
                        display: block;
                        width: 170px;
                        max-width: 100%;
                        height: auto;
                        margin: 0 auto 18px;
                      "
                    >

                    <p
                      style="
                        margin: 0;
                        color: #ffffff;
                        font-size: 18px;
                        font-weight: bold;
                      "
                    >
                      Tu cupón de bienvenida
                    </p>

                    <p
                      style="
                        margin: 8px 0 0;
                        color: #a1a1aa;
                        font-size: 13px;
                      "
                    >
                      Primera compra · TECNO 3D
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 36px 32px;
                    "
                  >

                    <h1
                      style="
                        margin: 0 0 16px;
                        color: #111827;
                        font-size: 24px;
                        line-height: 1.3;
                      "
                    >
                      ¡Hola ${safeName}! 👋
                    </h1>

                    <p
                      style="
                        margin: 0 0 24px;
                        color: #4b5563;
                        font-size: 16px;
                        line-height: 1.7;
                      "
                    >
                      Gracias por registrarte en TECNO 3D.
                      Este es tu código exclusivo para obtener
                      <strong style="color: #111827;">
                        ${WELCOME_PERCENT}% OFF
                      </strong>
                      en tu primera compra.
                    </p>

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        width: 100%;
                        background-color: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                      "
                    >
                      <tr>
                        <td
                          style="
                            padding: 24px;
                          "
                        >

                          <p
                            style="
                              margin: 0 0 8px;
                              color: #64748b;
                              font-size: 12px;
                              font-weight: bold;
                              letter-spacing: 1px;
                            "
                          >
                            TU BENEFICIO
                          </p>

                          <p
                            style="
                              margin: 0 0 22px;
                              color: #111827;
                              font-size: 20px;
                              font-weight: bold;
                            "
                          >
                            🎁 ${WELCOME_PERCENT}% OFF primera compra
                          </p>

                          <div
                            style="
                              height: 1px;
                              background-color: #e2e8f0;
                              margin: 20px 0;
                            "
                          ></div>

                          <table
                            role="presentation"
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                          >
                            <tr>
                              <td
                                width="48"
                                valign="top"
                                style="
                                  padding-right: 12px;
                                  font-size: 24px;
                                "
                              >
                                🏷️
                              </td>

                              <td
                                valign="top"
                              >
                                <p
                                  style="
                                    margin: 0 0 4px;
                                    color: #64748b;
                                    font-size: 12px;
                                  "
                                >
                                  CÓDIGO DE DESCUENTO
                                </p>

                                <p
                                  style="
                                    margin: 0;
                                    color: #111827;
                                    font-size: 18px;
                                    font-weight: bold;
                                    letter-spacing: 1px;
                                    word-break: break-all;
                                  "
                                >
                                  ${safeCode}
                                </p>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>

                    <p
                      style="
                        margin: 28px 0 0;
                        color: #4b5563;
                        font-size: 15px;
                        line-height: 1.7;
                      "
                    >
                      Aplica a todo el carrito, incluyendo productos en oferta.
                      Válido por ${WELCOME_VALID_DAYS} días y un solo uso, con tu cuenta.
                      Podés ingresarlo en el checkout o usarlo cuando ya aparezca cargado.
                    </p>

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        margin-top: 28px;
                      "
                    >
                      <tr>
                        <td align="center">

                          <a
                            href="${shopUrl}"
                            style="
                              display: inline-block;
                              padding: 15px 28px;
                              background-color: #dc2626;
                              color: #ffffff;
                              text-decoration: none;
                              border-radius: 8px;
                              font-size: 14px;
                              font-weight: bold;
                            "
                          >
                            IR A COMPRAR
                          </a>

                        </td>
                      </tr>
                    </table>

                    <p
                      style="
                        margin: 28px 0 0;
                        color: #64748b;
                        font-size: 13px;
                        line-height: 1.6;
                        text-align: center;
                      "
                    >
                      Si tenés alguna consulta, podés comunicarte con TECNO 3D.
                    </p>

                  </td>
                </tr>

                <tr>
                  <td
                    align="center"
                    style="
                      padding: 24px 32px;
                      background-color: #fafafa;
                      border-top: 1px solid #e5e7eb;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 6px;
                        color: #374151;
                        font-size: 13px;
                        font-weight: bold;
                      "
                    >
                      TECNO 3D
                    </p>

                    <p
                      style="
                        margin: 0;
                        color: #9ca3af;
                        font-size: 12px;
                        line-height: 1.5;
                      "
                    >
                      Este correo fue enviado automáticamente.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

export async function createWelcomeCouponForUser(
  user
) {
  const existing =
    await findWelcomeCouponByUserIdRepository(
      user.id
    );

  if (existing) {
    return existing;
  }

  let code;
  let exists = true;

  while (exists) {
    code = buildWelcomeCode();

    const collision =
      await findCouponByCodeRepository(
        code
      );

    exists = Boolean(collision);
  }

  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() +
      WELCOME_VALID_DAYS
  );

  const coupon =
    await createCouponRepository({
      code,
      type: "PERCENTAGE",
      value: WELCOME_PERCENT,
      maxUses: 1,
      expiresAt,
      active: true,
      applyToOfferItems: true,
      userId: user.id,
    });

  await sendWelcomeCouponEmail(
    user,
    coupon.code
  );

  return coupon;
}

const sendWelcomeCouponEmail = async (
  user,
  code
) => {
  if (!user?.email?.trim()) {
    console.warn(
      "Cupón de bienvenida sin email de destino."
    );
    return;
  }

  try {
    await sendEmail({
      to: user.email.trim(),
      subject:
        `Tu cupón ${WELCOME_PERCENT}% OFF de bienvenida - TECNO 3D`,
      html: buildWelcomeEmailHtml({
        firstName: user.firstName,
        code,
      }),
    });

    console.log(
      `📧 Cupón de bienvenida enviado a ${user.email}`
    );
  } catch (error) {
    console.error(
      `No se pudo enviar el correo de bienvenida a ${user.email}:`,
      error.message
    );
  }
};

export async function ensureWelcomeCouponForCustomer(
  user
) {
  if (
    !user ||
    user.role !== "CUSTOMER" ||
    !user.email?.trim()
  ) {
    return null;
  }

  const existing =
    await findWelcomeCouponByUserIdRepository(
      user.id
    );

  if (existing) {
    return existing;
  }

  return createWelcomeCouponForUser(user);
}

export async function getWelcomeCouponForUser(
  userId
) {
  const coupon =
    await findWelcomeCouponByUserIdRepository(
      userId
    );

  if (!coupon) {
    return null;
  }

  if (!coupon.active) {
    return null;
  }

  if (
    coupon.expiresAt &&
    coupon.expiresAt <= new Date()
  ) {
    return null;
  }

  if (
    coupon.maxUses !== null &&
    coupon.usedCount >= coupon.maxUses
  ) {
    return null;
  }

  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    applyToOfferItems:
      coupon.applyToOfferItems,
    expiresAt: coupon.expiresAt,
  };
}