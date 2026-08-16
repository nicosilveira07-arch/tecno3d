import {
  getDashboardData,
} from "../repositories/dashboard.repository.js";

/*
 * ============================================================
 * CONFIGURACIÓN
 * ============================================================
 */

const MAX_LOW_STOCK_LIMIT = 20;

/*
 * ============================================================
 * PARSEAR FECHA DEL DASHBOARD
 * ============================================================
 *
 * El frontend envía:
 *
 * YYYY-MM-DD
 *
 * Convertimos:
 *
 * inicio → 00:00:00.000
 * fin    → 23:59:59.999
 *
 * para que el último día del período
 * quede completamente incluido.
 */

const parseDashboardDate = (
  value,
  isEndDate = false,
) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    throw new Error(
      "Las fechas del período deben tener el formato YYYY-MM-DD.",
    );
  }

  const [
    year,
    month,
    day,
  ] = value.split("-").map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
    isEndDate ? 23 : 0,
    isEndDate ? 59 : 0,
    isEndDate ? 59 : 0,
    isEndDate ? 999 : 0,
  );

  /*
   * Verificamos que JavaScript no haya
   * corregido automáticamente una fecha inválida.
   *
   * Ejemplo:
   *
   * 2026-02-31
   *
   * JavaScript podría convertirla en marzo.
   */

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(
      "Las fechas del período no son válidas.",
    );
  }

  return date;
};

/*
 * ============================================================
 * SERVICE
 * ============================================================
 */

const getDashboardService = async ({
  startDate,
  endDate,
  lowStockLimit = 5,
}) => {
  /*
   * ----------------------------------------------------------
   * VALIDAR PERÍODO
   * ----------------------------------------------------------
   */

  if (!startDate || !endDate) {
    throw new Error(
      "El período del dashboard es obligatorio.",
    );
  }

  const start = parseDashboardDate(
    startDate,
    false,
  );

  const end = parseDashboardDate(
    endDate,
    true,
  );

  /*
   * ----------------------------------------------------------
   * VALIDAR RANGO
   * ----------------------------------------------------------
   */

  if (start > end) {
    throw new Error(
      "La fecha inicial no puede ser posterior a la fecha final.",
    );
  }

  /*
   * ----------------------------------------------------------
   * VALIDAR LÍMITE DE STOCK
   * ----------------------------------------------------------
   *
   * El frontend normalmente utilizará 5.
   *
   * Permitimos hasta 20 como máximo para
   * evitar consultas innecesariamente grandes.
   */

  const stockLimit = Number(
    lowStockLimit,
  );

  if (
    !Number.isInteger(stockLimit) ||
    stockLimit < 0
  ) {
    throw new Error(
      "El límite de stock debe ser un número entero mayor o igual a 0.",
    );
  }

  if (
    stockLimit >
    MAX_LOW_STOCK_LIMIT
  ) {
    throw new Error(
      `El límite de stock no puede superar ${MAX_LOW_STOCK_LIMIT}.`,
    );
  }

  /*
   * ----------------------------------------------------------
   * OBTENER DATOS
   * ----------------------------------------------------------
   *
   * El SERVICE valida y prepara los parámetros.
   *
   * El REPOSITORY se encarga de consultar PostgreSQL
   * y realizar los cálculos agregados.
   */

  return await getDashboardData({
    startDate: start,
    endDate: end,
    lowStockLimit: stockLimit,
  });
};

export {
  getDashboardService,
};