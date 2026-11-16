import jwt from "jsonwebtoken";

import { findById } from "../repositories/user.repository.js";

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado.",
      });
    }

    const [, token] = authHeader.split(" ");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Su sesión ha expirado",
      });
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Su sesión ha expirado",
    });
  }
}
