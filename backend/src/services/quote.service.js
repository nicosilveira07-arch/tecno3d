import cloudinary from "../lib/cloudinary.js";
import prisma from "../lib/prisma.js";

import {
  createQuoteRequest,
  findQuoteById,
  findQuoteByIdForUser,
  listQuotesByUser,
  listQuotesForAdmin,
  countQuotesByStatus,
  updateQuoteRequest,
} from "../repositories/quote.repository.js";

import {
  createCheckoutSession,
  deleteCheckoutSession,
  getActiveCheckoutSessionByUser,
} from "../repositories/checkoutSession.repository.js";

import {
  validatePieceSizeMm,
  validateQuoteContactPhone,
  validateQuoteQuantity,
  validateQuoteImagesCount,
  formatQuoteMeasurement,
  QUOTE_MAX_IMAGES,
} from "../constants/quoteSpecs.js";

const MAX_DESCRIPTION_LENGTH = 1000;
const QUOTE_FOLDER_PREFIX = "tecno3d/quotes";

const normalizeDescription = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const validateQuotedPrice = (price) => {
  const numeric = Number(price);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error(
      "El precio cotizado debe ser un número mayor a cero."
    );
  }

  if (numeric > 10_000_000) {
    throw new Error(
      "El precio cotizado supera el máximo permitido."
    );
  }

  return Math.round(numeric * 100) / 100;
};

const deleteQuoteImage = async (publicId) => {
  if (
    !publicId ||
    typeof publicId !== "string" ||
    !publicId.startsWith(QUOTE_FOLDER_PREFIX)
  ) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(
      "No se pudo eliminar imagen de cotización:",
      publicId,
      error
    );
  }
};

const deleteAllQuoteImages = async (quote) => {
  const images = quote?.images || [];

  for (const image of images) {
    await deleteQuoteImage(
      image.imagePublicId
    );
  }

  if (images.length > 0) {
    await prisma.quoteRequestImage.deleteMany({
      where: {
        quoteRequestId: quote.id,
      },
    });
  }
};

const uploadQuoteImage = async (fileBuffer) => {
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: QUOTE_FOLDER_PREFIX,
        resource_type: "image",
        transformation: [
          {
            width: 2000,
            height: 2000,
            crop: "limit",
            quality: "auto:good",
            fetch_format: "auto",
          },
        ],
      },
      (error, uploadResult) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(uploadResult);
      }
    );

    uploadStream.end(fileBuffer);
  });

  return {
    imageUrl: result.secure_url,
    imagePublicId: result.public_id,
  };
};

const createQuoteRequestService = async ({
  userId,
  description,
  quantity,
  widthMm,
  heightMm,
  contactPhone,
  files,
}) => {
  const normalizedDescription =
    normalizeDescription(description);

  if (
    normalizedDescription.length >
    MAX_DESCRIPTION_LENGTH
  ) {
    throw new Error(
      `Los detalles no pueden superar ${MAX_DESCRIPTION_LENGTH} caracteres.`
    );
  }

  const size = validatePieceSizeMm(
    widthMm,
    heightMm
  );

  const resolvedQuantity =
    validateQuoteQuantity(quantity);

  const resolvedContactPhone =
    validateQuoteContactPhone(contactPhone);

  const fileList = Array.isArray(files)
    ? files
    : [];

  validateQuoteImagesCount(
    fileList.length
  );

  if (fileList.length > QUOTE_MAX_IMAGES) {
    throw new Error(
      `Podés subir hasta ${QUOTE_MAX_IMAGES} imágenes.`
    );
  }

  const buffers = fileList
    .map((file) => file?.buffer)
    .filter(Boolean);

  if (buffers.length === 0) {
    throw new Error(
      "Debés adjuntar al menos una imagen de ejemplo."
    );
  }

  const uploadedImages = await Promise.all(
    buffers.map((buffer) =>
      uploadQuoteImage(buffer)
    )
  );

  if (uploadedImages.length === 0) {
    throw new Error(
      "Debés adjuntar al menos una imagen de ejemplo."
    );
  }

  return createQuoteRequest({
    userId,
    description: normalizedDescription,
    quantity: resolvedQuantity,
    widthMm: size.widthMm,
    heightMm: size.heightMm,
    contactPhone: resolvedContactPhone,
    status: "PENDING",
    images: {
      create: uploadedImages.map(
        (image, index) => ({
          imageUrl: image.imageUrl,
          imagePublicId:
            image.imagePublicId,
          sortOrder: index,
        })
      ),
    },
  });
};

const listMyQuotesService = async (userId) => {
  return listQuotesByUser(userId);
};

const ADMIN_STATUS_FILTERS = new Set([
  "PENDING",
  "QUOTED",
  "ACCEPTED",
  "PAID",
  "REJECTED_BY_CUSTOMER",
]);

const listQuotesAdminService = async (status) => {
  if (
    status &&
    !ADMIN_STATUS_FILTERS.has(status)
  ) {
    throw new Error(
      "Estado de filtro inválido."
    );
  }

  return listQuotesForAdmin(
    status ? { status } : {}
  );
};

const getQuoteAdminSummaryService = async () => {
  const [pendingCount, rejectedCount] =
    await Promise.all([
      countQuotesByStatus("PENDING"),
      countQuotesByStatus(
        "REJECTED_BY_CUSTOMER"
      ),
    ]);

  return {
    pendingCount,
    rejectedCount,
  };
};

const sendQuotePriceService = async ({
  quoteId,
  quotedPrice,
  adminMessage,
}) => {
  const quote = await findQuoteById(quoteId);

  if (!quote) {
    throw new Error(
      "La solicitud de cotización no existe."
    );
  }

  if (quote.status !== "PENDING") {
    throw new Error(
      "Solo se puede cotizar una solicitud pendiente."
    );
  }

  const price = validateQuotedPrice(
    quotedPrice
  );

  const message =
    typeof adminMessage === "string"
      ? adminMessage.trim().slice(0, 1000)
      : null;

  return updateQuoteRequest(quoteId, {
    quotedPrice: price,
    adminMessage: message || null,
    status: "QUOTED",
    quotedAt: new Date(),
  });
};

const rejectQuoteByCustomerService = async ({
  quoteId,
  userId,
}) => {
  const quote = await findQuoteByIdForUser(
    quoteId,
    userId
  );

  if (!quote) {
    throw new Error(
      "La cotización no existe."
    );
  }

  if (
    quote.status !== "QUOTED" &&
    quote.status !== "ACCEPTED"
  ) {
    throw new Error(
      "No podés rechazar esta cotización en su estado actual."
    );
  }

  if (quote.status === "ACCEPTED") {
    const linkedSession =
      quote.checkoutSession;

    if (linkedSession?.status === "COMPLETED") {
      throw new Error(
        "No podés rechazar una cotización que ya fue pagada."
      );
    }

    if (linkedSession?.id) {
      await deleteCheckoutSession(
        linkedSession.id,
        userId
      );
    }
  }

  await deleteAllQuoteImages(quote);

  return updateQuoteRequest(quoteId, {
    status: "REJECTED_BY_CUSTOMER",
    rejectedAt: new Date(),
  });
};

const acceptQuoteService = async ({
  quoteId,
  userId,
}) => {
  const quote = await findQuoteByIdForUser(
    quoteId,
    userId
  );

  if (!quote) {
    throw new Error(
      "La cotización no existe."
    );
  }

  if (quote.status !== "QUOTED") {
    throw new Error(
      "Solo podés aceptar una cotización que ya tiene precio."
    );
  }

  if (
    !quote.quotedPrice ||
    quote.quotedPrice <= 0
  ) {
    throw new Error(
      "La cotización no tiene un precio válido."
    );
  }

  const activeSession =
    await getActiveCheckoutSessionByUser(
      userId
    );

  if (activeSession) {
    await deleteCheckoutSession(
      activeSession.id,
      userId
    );
  }

  const expiresAt = new Date(
    Date.now() + 30 * 60 * 1000
  );

  const sizeLabel = formatQuoteMeasurement(
    quote.widthMm,
    quote.heightMm
  );

  const productName = `Cotización 3D ${sizeLabel} · ${quote.quantity} u. (#${quote.id.slice(-6).toUpperCase()})`;

  const session = await createCheckoutSession({
    userId,
    total: Number(quote.quotedPrice),
    discount: 0,
    couponId: null,
    quoteId: quote.id,
    deliveryMethod: "SHIPPING",
    addressId: null,
    status: "ACTIVE",
    expiresAt,
    items: {
      create: [
        {
          quantity: 1,
          price: Number(quote.quotedPrice),
          productName,
          productId: null,
          variantId: null,
          variantName: null,
        },
      ],
    },
  });

  await updateQuoteRequest(quoteId, {
    status: "ACCEPTED",
  });

  return session;
};

const getQuoteForCustomerService = async ({
  quoteId,
  userId,
}) => {
  const quote = await findQuoteByIdForUser(
    quoteId,
    userId
  );

  if (!quote) {
    throw new Error(
      "La cotización no existe."
    );
  }

  return quote;
};

export {
  createQuoteRequestService,
  listMyQuotesService,
  listQuotesAdminService,
  getQuoteAdminSummaryService,
  sendQuotePriceService,
  rejectQuoteByCustomerService,
  acceptQuoteService,
  getQuoteForCustomerService,
};