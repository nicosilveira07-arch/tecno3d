import {
  createCouponRepository,
  findCouponByCodeRepository,
  findCouponByIdRepository,
  findAllCouponsRepository,
  updateCouponRepository,
  deleteCouponRepository,
  incrementCouponUsageRepository,
} from "../repositories/coupon.repository.js";

import {
  assertCouponIsUsable,
} from "../utils/couponDiscount.js";

const generateCouponCode = () => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "TECNO-";

  for (let i = 0; i < 6; i++) {
    code += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }

  return code;
};

const createCouponService = async ({
  type,
  value,
  maxUses,
  expiresAt,
}) => {
  if (!type) {
    throw new Error("El tipo de cupón es obligatorio.");
  }

  if (!["PERCENTAGE", "FIXED"].includes(type)) {
    throw new Error("Tipo de cupón inválido.");
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new Error(
      "El valor del descuento debe ser mayor a 0.",
    );
  }

  if (
    type === "PERCENTAGE" &&
    numericValue > 100
  ) {
    throw new Error(
      "El porcentaje de descuento no puede superar el 100%.",
    );
  }

  let numericMaxUses = null;

  if (
    maxUses !== undefined &&
    maxUses !== null &&
    maxUses !== ""
  ) {
    numericMaxUses = Number(maxUses);

    if (
      !Number.isInteger(numericMaxUses) ||
      numericMaxUses <= 0
    ) {
      throw new Error(
        "La cantidad máxima de usos debe ser un número entero mayor a 0.",
      );
    }
  }

  let expirationDate = null;

  if (expiresAt) {
    expirationDate = new Date(expiresAt);

    if (Number.isNaN(expirationDate.getTime())) {
      throw new Error(
        "La fecha de vencimiento no es válida.",
      );
    }

    if (expirationDate <= new Date()) {
      throw new Error(
        "La fecha de vencimiento debe ser futura.",
      );
    }
  }

  let code;
  let exists = true;

  while (exists) {
    code = generateCouponCode();

    const existingCoupon =
      await findCouponByCodeRepository(code);

    exists = Boolean(existingCoupon);
  }

  return createCouponRepository({
    code,
    type,
    value: numericValue,
    maxUses: numericMaxUses,
    expiresAt: expirationDate,
  });
};

const getAllCouponsService = async () => {
  return findAllCouponsRepository();
};

const getCouponByIdService = async (id) => {
  const coupon =
    await findCouponByIdRepository(id);

  if (!coupon) {
    throw new Error("Cupón no encontrado.");
  }

  return coupon;
};

const validateCouponService = async (
  code,
  userId = null
) => {
  if (!code || !code.trim()) {
    throw new Error("Ingresá un código de cupón.");
  }

  const normalizedCode = code
    .trim()
    .toUpperCase();

  const coupon =
    await findCouponByCodeRepository(
      normalizedCode,
    );

  if (!coupon) {
    throw new Error("El cupón no existe.");
  }

  assertCouponIsUsable(coupon);

  if (
    coupon.userId &&
    userId &&
    coupon.userId !== userId
  ) {
    throw new Error(
      "Este cupón no está asignado a tu cuenta."
    );
  }

  if (coupon.userId && !userId) {
    throw new Error(
      "Debés iniciar sesión para usar este cupón."
    );
  }

  return coupon;
};

const updateCouponService = async (
  id,
  data,
) => {
  const coupon =
    await findCouponByIdRepository(id);

  if (!coupon) {
    throw new Error("Cupón no encontrado.");
  }

  const updateData = {};

  if (data.active !== undefined) {
    updateData.active = Boolean(data.active);
  }

  if (data.expiresAt !== undefined) {
    if (!data.expiresAt) {
      updateData.expiresAt = null;
    } else {
      const expirationDate =
        new Date(data.expiresAt);

      if (
        Number.isNaN(
          expirationDate.getTime(),
        )
      ) {
        throw new Error(
          "La fecha de vencimiento no es válida.",
        );
      }

      updateData.expiresAt =
        expirationDate;
    }
  }

  return updateCouponRepository(
    id,
    updateData,
  );
};

const deleteCouponService = async (id) => {
  const coupon =
    await findCouponByIdRepository(id);

  if (!coupon) {
    throw new Error("Cupón no encontrado.");
  }

  return deleteCouponRepository(id);
};

const useCouponService = async (id) => {
  const coupon =
    await validateCouponService(
      (
        await findCouponByIdRepository(id)
      )?.code,
    );

  return incrementCouponUsageRepository(
    coupon.id,
  );
};

export {
  createCouponService,
  getAllCouponsService,
  getCouponByIdService,
  validateCouponService,
  updateCouponService,
  deleteCouponService,
  useCouponService,
};