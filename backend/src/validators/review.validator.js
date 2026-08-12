import { z } from "zod";

const createReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "La calificación mínima es 1")
    .max(5, "La calificación máxima es 5"),

  comment: z
    .string()
    .trim()
    .max(
      1000,
      "El comentario no puede superar los 1000 caracteres"
    )
    .optional()
    .or(z.literal("")),
});

const updateReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "La calificación mínima es 1")
    .max(5, "La calificación máxima es 5")
    .optional(),

  comment: z
    .string()
    .trim()
    .max(
      1000,
      "El comentario no puede superar los 1000 caracteres"
    )
    .optional()
    .or(z.literal("")),
});

export {
  createReviewSchema,
  updateReviewSchema,
};

