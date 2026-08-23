import {
  register,
  login,
  changePassword,
} from "../services/auth.service.js";

import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";

// Registrar usuarios
export async function registerController(req, res) {
  try {
    const data = registerSchema.parse(req.body);

    const result = await register(data);

    return res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Login usuarios
export async function loginController(req, res) {
  try {
    const data = loginSchema.parse(req.body);

    const result = await login(
      data.email,
      data.password
    );

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso.",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
}

// Usuario autenticado
export function meController(req, res) {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
}

// Cambiar contraseña
export async function changePasswordController(req, res) {
  try {
    const data = changePasswordSchema.parse(req.body);

    const result = await changePassword(
      req.user.id,
      data.currentPassword,
      data.newPassword
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

