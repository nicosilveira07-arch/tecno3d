import prisma from "../lib/prisma.js";


const createCategory = async (data) => {
  return await prisma.category.create({
    data,
  });
};


const getCategories = async () => {
  return await prisma.category.findMany({
    include: {
      products: true,
    },
  });
};


const getCategoryById = async (id) => {
  return await prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      products: true,
    },
  });
};


const updateCategory = async (id, data) => {
  return await prisma.category.update({
    where: {
      id,
    },
    data,
  });
};


const deleteCategory = async (id) => {
  return await prisma.category.delete({
    where: {
      id,
    },
  });
};


export {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};