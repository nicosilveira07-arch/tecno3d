export function getCouponDiscountAmount({
  subtotal,
  couponEligibleSubtotal,
  coupon,
}) {
  if (!coupon) {
    return 0;
  }

  const base = coupon.applyToOfferItems
    ? subtotal
    : couponEligibleSubtotal;

  if (base <= 0) {
    return 0;
  }

  const raw =
    coupon.type === "PERCENTAGE"
      ? base * (coupon.value / 100)
      : Number(coupon.value);

  return Math.min(raw, base);
}