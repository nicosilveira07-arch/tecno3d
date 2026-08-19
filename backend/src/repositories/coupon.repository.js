import prisma from "../lib/prisma.js";

const createCouponRepository = async (data) => {
  return prisma.coupon.create({
    data,
  });
};

const findCouponByCodeRepository = async (code) => {
  return prisma.coupon.findUnique({
    where: {
      code,
    },
  });
};

const findCouponByIdRepository = async (id) => {
  return prisma.coupon.findUnique({
    where: {
      id,
    },
  });
};

const findAllCouponsRepository = async () => {
  return prisma.coupon.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateCouponRepository = async (id, data) => {
  return prisma.coupon.update({
    where: {
      id,
    },
    data,
  });
};

const deleteCouponRepository = async (id) => {
  return prisma.coupon.delete({
    where: {
      id,
    },
  });
};

const incrementCouponUsageRepository = async (id) => {
  return prisma.coupon.update({
    where: {
      id,
    },
    data: {
      usedCount: {
        increment: 1,
      },
    },
  });
};

export {
  createCouponRepository,
  findCouponByCodeRepository,
  findCouponByIdRepository,
  findAllCouponsRepository,
  updateCouponRepository,
  deleteCouponRepository,
  incrementCouponUsageRepository,
};