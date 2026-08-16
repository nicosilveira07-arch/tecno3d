import { z } from "zod";

export const createBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar los 100 caracteres."),

  slug: z
    .string()
    .trim()
    .min(2, "El slug debe tener al menos 2 caracteres.")
    .max(100, "El slug no puede superar los 100 caracteres."),

  image: z
    .string()
    .url("La imagen debe ser una URL válida.")
    .optional()
    .or(z.literal("")),

  featured: z.boolean().optional(),
});

export const updateBrandSchema =
  createBrandSchema.partial();