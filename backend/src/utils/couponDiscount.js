const assertCouponIsUsable = (coupon) => {
  if (!coupon) {
    throw new Error("El cupón no existe.");
  }

  if (!coupon.active) {
    throw new Error("El cupón está inactivo.");
  }

  if (
    coupon.expiresAt &&
    coupon.expiresAt <= new Date()
  ) {
    throw new Error("El cupón está vencido.");
  }

  if (
    coupon.maxUses !== null &&
    coupon.usedCount >= coupon.maxUses
  ) {
    throw new Error(
      "El cupón alcanzó el máximo de usos."
    );
  }
};

const resolveCouponDiscount = ({
  subtotal,
  couponEligibleSubtotal,
  coupon,
  userId,
}) => {
  if (!coupon) {
    return {
      discount: 0,
      couponId: null,
    };
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

  const appliesToOffers = Boolean(
    coupon.applyToOfferItems
  );

  const discountBase = appliesToOffers
    ? subtotal
    : couponEligibleSubtotal;

  if (discountBase <= 0) {
    if (appliesToOffers) {
      throw new Error(
        "El carrito no tiene productos válidos para el cupón."
      );
    }

    throw new Error(
      "Los productos con descuento no admiten cupones."
    );
  }

  let discount = 0;

  if (coupon.type === "PERCENTAGE") {
    discount =
      discountBase *
      (Number(coupon.value) / 100);
  } else if (coupon.type === "FIXED") {
    discount = Number(coupon.value);
  }

  discount = Math.min(
    discount,
    discountBase
  );

  return {
    discount,
    couponId: coupon.id,
  };
};

export {
  assertCouponIsUsable,
  resolveCouponDiscount,
};