import { z } from "zod";

export const productQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((value) => Number(value) || 1)
    .refine((value) => value > 0, {
      message: "La página debe ser mayor a 0.",
    }),

  limit: z
    .string()
    .optional()
    .transform((value) => Number(value) || 10)
    .refine((value) => value > 0 && value <= 100, {
      message: "El límite debe estar entre 1 y 100.",
    }),

  search: z.string().optional(),

  categoryId: z.string().optional(),

  brandId: z.string().optional(),

  offerActive: z
    .string()
    .optional()
    .transform((value) => {
      if (value === "true") return true;
      if (value === "false") return false;
      return undefined;
    }),

  sort: z
    .enum([
      "price_asc",
      "price_desc",
      "newest",
    ])
    .optional(),
});

