import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  findByEmail,
  createUser,
  findById,
  updateUserPassword,
} from "../repositories/user.repository.js";

export async function register(userData) {
  const exists = await findByEmail(userData.email);

  if (exists) {
    throw new Error("El correo ya está registrado.");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 12);

  const user = await createUser({
    ...userData,
    password: hashedPassword,
    role: "CUSTOMER",
  });

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
    throw new Error("La contraseña actual es incorrecta.");
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
    message: "Contraseña actualizada correctamente.",
  };
}