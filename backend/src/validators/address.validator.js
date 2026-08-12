import { z } from "zod";


const addressSchema = z.object({
  title: z
    .string()
    .min(2, "El título es obligatorio."),

  street: z
    .string()
    .min(2, "La calle es obligatoria."),

  number: z
    .string()
    .min(1, "El número es obligatorio."),

  city: z
    .string()
    .min(2, "La ciudad es obligatoria."),

  state: z
    .string()
    .min(2, "El departamento/provincia es obligatorio."),

  country: z
    .string()
    .min(2, "El país es obligatorio."),

  zipCode: z
    .string()
    .min(2, "El código postal es obligatorio."),

  isDefault: z
    .boolean()
    .optional(),
});


const updateAddressSchema = addressSchema.partial();


export {
  addressSchema,
  updateAddressSchema,
};