import {
  createOrderService,
  getPendingOrderService,
  cancelPendingOrderService,
  getMyOrdersService,
  getOrdersService,
  getOrderByIdService,
  updateOrderStatusService,
} from "../services/order.service.js";

const createOrderController = async (
  req,
  res,
  next
) => {
  try {
    const order =
      await createOrderService({
        ...req.body,
        userId: req.user.id,
      });

    res.status(201).json({
      success: true,
      message:
        "Pedido creado correctamente.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getPendingOrderController = async (
  req,
  res,
  next
) => {
  try {
    const order =
      await getPendingOrderService(
        req.params.id,
        req.user.id
      );

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const cancelPendingOrderController = async (
  req,
  res,
  next
) => {
  try {
    const order =
      await cancelPendingOrderService(
        req.params.id,
        req.user.id
      );

    res.json({
      success: true,
      message:
        "La compra pendiente fue cancelada correctamente.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrdersController = async (
  req,
  res,
  next
) => {
  try {
    const orders =
      await getMyOrdersService(
        req.user.id
      );

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrdersController = async (
  req,
  res,
  next
) => {
  try {
    const orders =
      await getOrdersService();

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderByIdController = async (
  req,
  res,
  next
) => {
  try {
    const order =
      await getOrderByIdService(
        req.params.id,
        req.user
      );

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatusController = async (
  req,
  res,
  next
) => {
  try {
    const {
      status,
      shippingCompany,
      trackingNumber,
    } = req.body;

    const order =
      await updateOrderStatusService(
        req.params.id,
        status,
        shippingCompany,
        trackingNumber
      );

    res.json({
      success: true,
      message:
        "Estado del pedido actualizado correctamente.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createOrderController,
  getPendingOrderController,
  cancelPendingOrderController,
  getMyOrdersController,
  getOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
};

