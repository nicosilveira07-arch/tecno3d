import prisma from "../lib/prisma.js";


export async function findAllByUser(userId) {
  return await prisma.address.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}


export async function findById(id) {
  return await prisma.address.findUnique({
    where: {
      id,
    },
  });
}


export async function createAddress(data) {
  return await prisma.address.create({
    data,
  });
}


export async function updateAddress(id, data) {
  return await prisma.address.update({
    where: {
      id,
    },
    data,
  });
}


export async function deleteAddress(id) {
  return await prisma.address.delete({
    where: {
      id,
    },
  });
}