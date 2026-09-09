import {
  createCheckoutSessionService,
  getCheckoutSessionService,
  updateCheckoutSessionService,
  markCheckoutSessionPaymentPendingService,
  deleteCheckoutSessionService,
  getPendingCheckoutSessionsByUserService,
  getPendingCheckoutSessionsService,
} from "../services/checkoutSession.service.js";

// ======================================================
// CREAR CHECKOUT SESSION
// ======================================================

const createCheckoutSessionController = async (
req,
res,
next
) => {
try {
const userId = req.user.id;


const session =
  await createCheckoutSessionService({
    ...req.body,
    userId,
  });

return res.status(201).json({
  success: true,
  message:
    "Sesión de checkout creada correctamente.",
  data: session,
});


} catch (error) {
next(error);
}
};

// ======================================================
// OBTENER CHECKOUT SESSION
// ======================================================

const getCheckoutSessionController = async (
req,
res,
next
) => {
try {
const userId = req.user.id;


const session =
  await getCheckoutSessionService(
    req.params.id,
    userId
  );

return res.status(200).json({
  success: true,
  data: session,
});


} catch (error) {
next(error);
}
};

// ======================================================
// ACTUALIZAR CHECKOUT SESSION
// ======================================================

const updateCheckoutSessionController = async (
req,
res,
next
) => {
try {
const userId = req.user.id;

const session =
  await updateCheckoutSessionService(
    req.params.id,
    userId,
    req.body
  );

return res.status(200).json({
  success: true,
  message:
    "Sesión de checkout actualizada correctamente.",
  data: session,
});


} catch (error) {
next(error);
}
};

// ======================================================
// MARCAR PAGO PENDIENTE
// ======================================================

const markCheckoutSessionPaymentPendingController =
async (
req,
res,
next
) => {
try {
const userId = req.user.id;


  const session =
    await markCheckoutSessionPaymentPendingService(
      req.params.id,
      userId,
      req.body
    );

  return res.status(200).json({
    success: true,
    message:
      "El pago quedó pendiente correctamente.",
    data: session,
  });
} catch (error) {
  next(error);
}


};
// ======================================================
// CHECKOUTS EN TRÁMITE DEL USUARIO
// ======================================================

const getPendingCheckoutSessionsByUserController =
async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const sessions =
      await getPendingCheckoutSessionsByUserService(
        userId
      );

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// CHECKOUTS EN TRÁMITE PARA ADMIN
// ======================================================

const getPendingCheckoutSessionsController =
async (
  req,
  res,
  next
) => {
  try {
    const sessions =
      await getPendingCheckoutSessionsService();

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};
// ======================================================
// ELIMINAR CHECKOUT SESSION
// ======================================================

const deleteCheckoutSessionController = async (
req,
res,
next
) => {
try {
const userId = req.user.id;


const result =
  await deleteCheckoutSessionService(
    req.params.id,
    userId
  );

return res.status(200).json({
  success: true,
  message:
    "Sesión de checkout eliminada correctamente.",
  data: result,
});


} catch (error) {
next(error);
}
};

export {
createCheckoutSessionController,
getCheckoutSessionController,
updateCheckoutSessionController,
markCheckoutSessionPaymentPendingController,
deleteCheckoutSessionController,
getPendingCheckoutSessionsByUserController,
getPendingCheckoutSessionsController,
};
