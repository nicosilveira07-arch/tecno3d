import { productSchema } from "./product.validator.js";


const updateProductSchema = productSchema.partial();


export {
  updateProductSchema,
};
