import { z } from "zod";

const addToCartSchema = z.object({
  productId: z
    .string()
    .min(1, "El producto es obligatorio."),

  quantity: z
    .number()
    .int("La cantidad debe ser un número entero.")
    .positive("La cantidad debe ser mayor a 0."),

  variantId: z
    .string()
    .min(1, "La variante no es válida.")
    .nullable()
    .optional(),
});

export {
  addToCartSchema,
};

