import {
  createCouponService,
  getAllCouponsService,
  getCouponByIdService,
  validateCouponService,
  updateCouponService,
  deleteCouponService,
} from "../services/coupon.service.js";

const createCouponController = async (
  req,
  res,
  next,
) => {
  try {
    const coupon =
      await createCouponService(req.body);

    res.status(201).json({
      success: true,
      message: "Cupón creado correctamente.",
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCouponsController = async (
  req,
  res,
  next,
) => {
  try {
    const coupons =
      await getAllCouponsService();

    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

const getCouponByIdController = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = req.params;

    const coupon =
      await getCouponByIdService(id);

    res.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

const validateCouponController = async (
  req,
  res,
  next,
) => {
  try {
    const { code } = req.body;

    const coupon =
      await validateCouponService(code);

    res.json({
      success: true,
      message: "Cupón válido.",
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

const updateCouponController = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = req.params;

    const coupon =
      await updateCouponService(
        id,
        req.body,
      );

    res.json({
      success: true,
      message:
        "Cupón actualizado correctamente.",
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCouponController = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = req.params;

    await deleteCouponService(id);

    res.json({
      success: true,
      message:
        "Cupón eliminado correctamente.",
    });
  } catch (error) {
    next(error);
  }
};

export {
  createCouponController,
  getAllCouponsController,
  getCouponByIdController,
  validateCouponController,
  updateCouponController,
  deleteCouponController,
};