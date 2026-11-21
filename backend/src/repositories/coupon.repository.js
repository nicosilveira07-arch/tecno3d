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

const findWelcomeCouponByUserIdRepository = async (
  userId
) => {
  return prisma.coupon.findFirst({
    where: {
      userId,
      applyToOfferItems: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

const incrementCouponUsageRepository = async (
  id,
  db = prisma
) => {
  const coupon = await db.coupon.findUnique({
    where: {
      id,
    },
  });

  if (!coupon) {
    throw new Error("El cupón no existe.");
  }

  if (coupon.maxUses === null) {
    return db.coupon.update({
      where: {
        id,
      },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });
  }

  const updated = await db.coupon.updateMany({
    where: {
      id,
      usedCount: {
        lt: coupon.maxUses,
      },
    },
    data: {
      usedCount: {
        increment: 1,
      },
    },
  });

  if (updated.count === 0) {
    throw new Error(
      "El cupón alcanzó el máximo de usos."
    );
  }

  return db.coupon.findUnique({
    where: {
      id,
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
  findWelcomeCouponByUserIdRepository,
};