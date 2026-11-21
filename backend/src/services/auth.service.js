import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import crypto from "crypto";

import { OAuth2Client } from "google-auth-library";

import {
  findByEmail,
  findByGoogleId,
  createUser,
  updateUserGoogleId,
  findById,
  updateUserPassword,
} from "../repositories/user.repository.js";

import {
  ensureWelcomeCouponForCustomer,
} from "./welcomeCoupon.service.js";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

export async function register(userData) {
  const exists = await findByEmail(userData.email);

  if (exists) {
    throw new Error("El correo ya está registrado.");
  }

  const hashedPassword = await bcrypt.hash(
    userData.password,
    12
  );

  const user = await createUser({
    ...userData,
    password: hashedPassword,
    role: "CUSTOMER",
  });

  const welcomeCoupon =
    await ensureWelcomeCouponForCustomer(user);

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  const { password, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword,
    welcomeCoupon: {
      id: welcomeCoupon.id,
      code: welcomeCoupon.code,
      type: welcomeCoupon.type,
      value: welcomeCoupon.value,
      applyToOfferItems:
        welcomeCoupon.applyToOfferItems,
      expiresAt: welcomeCoupon.expiresAt,
    },
  };
}

// LOGIN

export async function login(email, password) {
  const user = await findByEmail(email);

  if (!user) {
    throw new Error("Contraseña incorrecta");
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatch) {
    throw new Error("Contraseña incorrecta");
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  const { password: _, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword,
  };
}

// LOGIN CON GOOGLE

export async function googleLogin(credential) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error(
      "GOOGLE_CLIENT_ID no está configurado en el servidor."
    );
  }

  let payload;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    payload = ticket.getPayload();
  } catch (error) {
    console.error(
      "ERROR VERIFICANDO TOKEN DE GOOGLE:",
      error.message
    );

    throw new Error(
      "La credencial de Google no es válida."
    );
  }

  if (!payload) {
    throw new Error(
      "No se pudo obtener la información de Google."
    );
  }

  const {
    sub: googleId,
    email,
    email_verified: emailVerified,
    given_name: firstName,
    family_name: lastName,
    picture: avatar,
  } = payload;

  if (!googleId) {
    throw new Error(
      "Google no proporcionó un identificador válido."
    );
  }

  if (!email) {
    throw new Error(
      "Google no proporcionó un correo electrónico."
    );
  }

  if (!emailVerified) {
    throw new Error(
      "El correo de Google no está verificado."
    );
  }

  // 1. Buscar una cuenta que ya esté vinculada con Google
  let user = await findByGoogleId(googleId);

  // 2. Si existe, iniciar sesión
  if (user) {
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  // 3. Buscar si ya existe una cuenta con ese email
  user = await findByEmail(email);

  let isNewUser = false;

  // 4. Si existe, vincularla con Google
  if (user) {
    user = await updateUserGoogleId(
      user.id,
      googleId
    );
  } else {
    // 5. Crear nuevo usuario CUSTOMER
    isNewUser = true;

    const temporaryPassword = crypto.randomBytes(32).toString("hex");

    const hashedPassword = await bcrypt.hash(
      temporaryPassword,
      12
    );

    user = await createUser({
      email,
      firstName: firstName || "",
      lastName: lastName || "",
      avatar: avatar || null,
      password: hashedPassword,
      role: "CUSTOMER",
      googleId,
    });
  }

  let welcomeCoupon = null;

  if (isNewUser) {
    welcomeCoupon =
      await ensureWelcomeCouponForCustomer(user);
  } else if (user.role === "CUSTOMER") {
    welcomeCoupon =
      await ensureWelcomeCouponForCustomer(
        user
      );
  }

  // 6. Generar nuestro JWT
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  const { password: _, ...userWithoutPassword } = user;

  const response = {
    token,
    user: userWithoutPassword,
  };

  if (welcomeCoupon) {
    response.welcomeCoupon = {
      id: welcomeCoupon.id,
      code: welcomeCoupon.code,
      type: welcomeCoupon.type,
      value: welcomeCoupon.value,
      applyToOfferItems:
        welcomeCoupon.applyToOfferItems,
      expiresAt: welcomeCoupon.expiresAt,
    };
  }

  return response;
}

// CAMBIAR CONTRASEÑA

export async function changePassword(
  userId,
  currentPassword,
  newPassword
) {
  const user = await findById(userId);

  if (!user) {
    throw new Error("Usuario no encontrado.");
  }

  const passwordMatch = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!passwordMatch) {
    throw new Error(
      "La contraseña actual es incorrecta."
    );
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    12
  );

  await updateUserPassword(
    userId,
    hashedPassword
  );

  return {
    message:
      "Contraseña actualizada correctamente.",
  };
}