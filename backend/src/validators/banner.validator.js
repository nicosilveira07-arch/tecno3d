import { z } from "zod";

const createBannerSchema = z.object({
  title: z.string().min(1, "El título es obligatorio."),
  description: z.string().optional().default(""),
  buttonText: z.string().optional().default("Comprar ahora"),
  link: z.string().optional().default("/offers"),
  image: z.string().min(1, "La imagen es obligatoria."),
  active: z.boolean().optional().default(true),
});

const updateBannerSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  link: z.string().optional(),
  image: z.string().min(1).optional(),
  active: z.boolean().optional(),
});

export {
  createBannerSchema,
  updateBannerSchema,
};