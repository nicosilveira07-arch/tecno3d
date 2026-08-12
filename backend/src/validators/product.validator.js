import { z } from "zod";

const productImageSchema = z.object({
  url: z.string().url("La URL de la imagen no es válida."),
  publicId: z.string().optional().default(""),
});

const productSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener mínimo 3 caracteres."),

  slug: z
    .string()
    .min(3, "El slug debe tener mínimo 3 caracteres."),

  description: z
    .string()
    .min(10, "La descripción debe tener mínimo 10 caracteres."),

  price: z
    .number()
    .positive("El precio debe ser mayor a 0."),

  offerPrice: z
    .number()
    .positive("El precio de oferta debe ser mayor a 0.")
    .nullable()
    .optional(),

  offerPercentage: z
    .number()
    .int("El porcentaje debe ser un número entero.")
    .min(1, "El porcentaje debe ser mayor a 0.")
    .max(99, "El porcentaje no puede superar 99.")
    .nullable()
    .optional(),

  offerActive: z
    .boolean()
    .optional()
    .default(false),

  stock: z
    .number()
    .int("El stock debe ser un número entero.")
    .nonnegative("El stock no puede ser negativo."),

  image: z
    .string()
    .nullable()
    .optional(),

  images: z
    .array(productImageSchema)
    .optional()
    .default([]),

  categoryId: z
    .string()
    .min(1, "La categoría es obligatoria."),

  brandId: z
    .string()
    .min(1, "La marca es obligatoria."),
});

export {
  productSchema,
};