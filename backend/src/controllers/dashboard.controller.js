import {
  getDashboardService,
} from "../services/dashboard.service.js";

const getDashboardController = async (
  req,
  res,
  next,
) => {
  try {
    const {
      startDate,
      endDate,
      lowStockLimit = 5,
    } = req.query;

    const dashboard =
      await getDashboardService({
        startDate,
        endDate,
        lowStockLimit,
      });

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getDashboardController,
};