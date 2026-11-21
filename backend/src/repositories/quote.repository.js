import prisma from "../lib/prisma.js";

const quoteInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },
  checkoutSession: {
    select: {
      id: true,
      status: true,
    },
  },
  images: {
    orderBy: {
      sortOrder: "asc",
    },
  },
};

const createQuoteRequest = async (data) => {
  return prisma.quoteRequest.create({
    data,
    include: quoteInclude,
  });
};

const findQuoteById = async (id) => {
  return prisma.quoteRequest.findUnique({
    where: { id },
    include: quoteInclude,
  });
};

const findQuoteByIdForUser = async (id, userId) => {
  return prisma.quoteRequest.findFirst({
    where: { id, userId },
    include: quoteInclude,
  });
};

const listQuotesByUser = async (userId) => {
  return prisma.quoteRequest.findMany({
    where: {
      userId,
      status: {
        not: "REJECTED_BY_CUSTOMER",
      },
    },
    orderBy: { createdAt: "desc" },
    include: quoteInclude,
  });
};

const listQuotesForAdmin = async (filters = {}) => {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  return prisma.quoteRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: quoteInclude,
  });
};

const countQuotesByStatus = async (status) => {
  return prisma.quoteRequest.count({
    where: { status },
  });
};

const updateQuoteRequest = async (id, data) => {
  return prisma.quoteRequest.update({
    where: { id },
    data,
    include: quoteInclude,
  });
};

const deleteQuoteRequest = async (id) => {
  return prisma.quoteRequest.delete({
    where: { id },
  });
};

export {
  createQuoteRequest,
  findQuoteById,
  findQuoteByIdForUser,
  listQuotesByUser,
  listQuotesForAdmin,
  countQuotesByStatus,
  updateQuoteRequest,
  deleteQuoteRequest,
  quoteInclude,
};