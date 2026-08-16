import { z } from "zod";

const categorySchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener mínimo 3 caracteres."),

  slug: z
    .string()
    .min(3, "El slug debe tener mínimo 3 caracteres."),

  image: z
    .string()
    .nullable()
    .optional(),

  featured: z
    .boolean()
    .optional(),
});

export {
  categorySchema,
};