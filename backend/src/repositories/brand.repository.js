import prisma from "../lib/prisma.js";

export async function findAllBrands() {
  return prisma.brand.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function findBrandById(id) {
  return prisma.brand.findUnique({
    where: {
      id,
    },
  });
}

export async function findBrandBySlug(slug) {
  return prisma.brand.findUnique({
    where: {
      slug,
    },
  });
}

export async function createBrand(data) {
  return prisma.brand.create({
    data,
  });
}

export async function updateBrand(id, data) {
  return prisma.brand.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteBrand(id) {
  return prisma.brand.delete({
    where: {
      id,
    },
  });
}