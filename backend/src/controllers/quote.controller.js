import {
  createQuoteRequestService,
  listMyQuotesService,
  listQuotesAdminService,
  getQuoteAdminSummaryService,
  sendQuotePriceService,
  rejectQuoteByCustomerService,
  acceptQuoteService,
  getQuoteForCustomerService,
} from "../services/quote.service.js";

const createQuoteRequestController = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const quote =
      await createQuoteRequestService({
        userId,
        description: req.body?.description,
        quantity: req.body?.quantity,
        widthMm: req.body?.widthMm,
        heightMm: req.body?.heightMm,
        contactPhone: req.body?.contactPhone,
        files: req.files,
      });

    return res.status(201).json({
      success: true,
      message:
        "Solicitud enviada. Te avisaremos cuando tengamos el precio.",
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

const listMyQuotesController = async (
  req,
  res,
  next
) => {
  try {
    const quotes = await listMyQuotesService(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: quotes,
    });
  } catch (error) {
    next(error);
  }
};

const getMyQuoteController = async (
  req,
  res,
  next
) => {
  try {
    const quote =
      await getQuoteForCustomerService({
        quoteId: req.params.id,
        userId: req.user.id,
      });

    return res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

const rejectQuoteController = async (
  req,
  res,
  next
) => {
  try {
    const quote =
      await rejectQuoteByCustomerService({
        quoteId: req.params.id,
        userId: req.user.id,
      });

    return res.status(200).json({
      success: true,
      message:
        "Cotización rechazada. La solicitud fue cerrada.",
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

const acceptQuoteController = async (
  req,
  res,
  next
) => {
  try {
    const session = await acceptQuoteService({
      quoteId: req.params.id,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Cotización aceptada. Continuá con el pago.",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

const listQuotesAdminController = async (
  req,
  res,
  next
) => {
  try {
    const status =
      typeof req.query.status === "string"
        ? req.query.status.trim().toUpperCase()
        : undefined;

    const quotes = await listQuotesAdminService(
      status
    );

    return res.status(200).json({
      success: true,
      data: quotes,
    });
  } catch (error) {
    next(error);
  }
};

const getQuoteAdminSummaryController = async (
  req,
  res,
  next
) => {
  try {
    const summary =
      await getQuoteAdminSummaryService();

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

const sendQuotePriceController = async (
  req,
  res,
  next
) => {
  try {
    const quote = await sendQuotePriceService({
      quoteId: req.params.id,
      quotedPrice: req.body?.quotedPrice,
      adminMessage: req.body?.adminMessage,
    });

    return res.status(200).json({
      success: true,
      message:
        "Precio enviado al cliente.",
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createQuoteRequestController,
  listMyQuotesController,
  getMyQuoteController,
  rejectQuoteController,
  acceptQuoteController,
  listQuotesAdminController,
  getQuoteAdminSummaryController,
  sendQuotePriceController,
};