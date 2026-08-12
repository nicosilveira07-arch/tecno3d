import { categorySchema } from "./category.validator.js";


const updateCategorySchema = categorySchema.partial();


export {
  updateCategorySchema,
};