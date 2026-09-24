import { OAuth2Client } from "google-auth-library";

const {
  GOOGLE_GMAIL_CLIENT_ID,
  GOOGLE_GMAIL_CLIENT_SECRET,
  GOOGLE_GMAIL_REDIRECT_URI,
  GOOGLE_GMAIL_REFRESH_TOKEN,
} = process.env;

const GMAIL_SEND_URL =
  "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

const oauth2Client = new OAuth2Client(
  GOOGLE_GMAIL_CLIENT_ID,
  GOOGLE_GMAIL_CLIENT_SECRET,
  GOOGLE_GMAIL_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: GOOGLE_GMAIL_REFRESH_TOKEN,
});

function encodeBase64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function encodeHeader(value) {
  return `=?UTF-8?B?${Buffer.from(value).toString("base64")}?=`;
}

function createRawMessage({ to, subject, html }) {
  const message = [
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
  ].join("\r\n");

  return encodeBase64Url(message);
}

export async function sendEmail({ to, subject, html }) {
  if (!to) {
    throw new Error("El destinatario del correo es obligatorio.");
  }

  if (!subject) {
    throw new Error("El asunto del correo es obligatorio.");
  }

  if (!html) {
    throw new Error("El contenido HTML del correo es obligatorio.");
  }

  if (
    !GOOGLE_GMAIL_CLIENT_ID ||
    !GOOGLE_GMAIL_CLIENT_SECRET ||
    !GOOGLE_GMAIL_REDIRECT_URI ||
    !GOOGLE_GMAIL_REFRESH_TOKEN
  ) {
    throw new Error(
      "Faltan variables de configuración de Gmail en el archivo .env."
    );
  }

  try {
    const accessTokenResponse = await oauth2Client.getAccessToken();

    const accessToken = accessTokenResponse?.token;

    if (!accessToken) {
      throw new Error(
        "No se pudo obtener un access token válido de Gmail."
      );
    }

    const raw = createRawMessage({
      to,
      subject,
      html,
    });

    const response = await fetch(GMAIL_SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error de Gmail API:", data);

      throw new Error(
        data?.error?.message ||
          "Gmail rechazó el envío del correo."
      );
    }

    console.log("✅ Correo enviado correctamente:", data.id);

    return data;
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    throw error;
  }
}