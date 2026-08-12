import {
  getDashboardData,
} from "../repositories/dashboard.repository.js";

const getDashboardService = async ({
  startDate,
  endDate,
  lowStockLimit = 5,
}) => {
  if (!startDate || !endDate) {
    throw new Error(
      "El período del dashboard es obligatorio.",
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new Error(
      "Las fechas del período no son válidas.",
    );
  }

  if (start > end) {
    throw new Error(
      "La fecha inicial no puede ser posterior a la fecha final.",
    );
  }

  const stockLimit = Number(lowStockLimit);

  if (
    !Number.isInteger(stockLimit) ||
    stockLimit < 0
  ) {
    throw new Error(
      "El límite de stock debe ser un número entero mayor o igual a 0.",
    );
  }

  return await getDashboardData({
    startDate: start,
    endDate: end,
    lowStockLimit: stockLimit,
  });
};

export {
  getDashboardService,
};