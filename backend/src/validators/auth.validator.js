import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "La contraseña actual es obligatoria."),

    newPassword: z
      .string()
      .min(
        8,
        "La nueva contraseña debe tener al menos 8 caracteres."
      ),

    confirmPassword: z
      .string()
      .min(
        8,
        "La confirmación debe tener al menos 8 caracteres."
      ),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: "Las nuevas contraseñas no coinciden.",
      path: ["confirmPassword"],
    }
  )
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message:
        "La nueva contraseña debe ser diferente a la contraseña actual.",
      path: ["newPassword"],
    }
  );