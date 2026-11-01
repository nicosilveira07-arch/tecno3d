import prisma from "../lib/prisma.js";

const normalizeSearch = (search) => {
  if (!search) return [];

  const value = search
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const synonyms = {
    maus: ["mouse", "mouses"],
    mouse: ["mouse", "mouses"],
    mouses: ["mouse", "mouses"],

    impresora: [
      "impresora",
      "impresoras",
      "impresora 3d",
    ],
    impresoras: [
      "impresora",
      "impresoras",
      "impresora 3d",
    ],

    notebook: [
      "notebook",
      "notebooks",
      "laptop",
      "laptops",
    ],
    notebooks: [
      "notebook",
      "notebooks",
      "laptop",
      "laptops",
    ],
    laptop: [
      "notebook",
      "notebooks",
      "laptop",
      "laptops",
    ],

    teclado: ["teclado", "teclados"],
    teclados: ["teclado", "teclados"],

    monitor: [
      "monitor",
      "monitores",
      "pantalla",
      "pantallas",
    ],
    monitores: [
      "monitor",
      "monitores",
      "pantalla",
      "pantallas",
    ],

    filamento: ["filamento", "filamentos"],
    filamentos: ["filamento", "filamentos"],

    resina: ["resina", "resinas"],
    resinas: ["resina", "resinas"],

    accesorio: ["accesorio", "accesorios"],
    accesorios: ["accesorio", "accesorios"],

    repuesto: ["repuesto", "repuestos"],
    repuestos: ["repuesto", "repuestos"],

    auricular: [
      "auricular",
      "auriculares",
      "headset",
    ],
    auriculares: [
      "auricular",
      "auriculares",
      "headset",
    ],
  };

  return synonyms[value] || [value];
};

/**
 * Genera un slug disponible manteniendo el slug original
 * cuando todavía no existe.
 *
 * Ejemplo:
 * notebook-asus-tuf-gamer-156
 * notebook-asus-tuf-gamer-156-2
 * notebook-asus-tuf-gamer-156-3
 */
const getUniqueSlug = async (tx, baseSlug) => {
  const existingProduct = await tx.product.findUnique({
    where: {
      slug: baseSlug,
    },
    select: {
      id: true,
    },
  });

  if (!existingProduct) {
    return baseSlug;
  }

  let counter = 2;

  while (true) {
    const candidateSlug = `${baseSlug}-${counter}`;

    const existingCandidate = await tx.product.findUnique({
      where: {
        slug: candidateSlug,
      },
      select: {
        id: true,
      },
    });

    if (!existingCandidate) {
      return candidateSlug;
    }

    counter++;
  }
};

/**
 * Calcula el stock total de todas las variantes.
 */
const getVariantsStock = (variants = []) => {
  return variants.reduce(
    (total, variant) =>
      total + Number(variant.stock || 0),
    0
  );
};

/**
 * Crea las imágenes correspondientes a una variante.
 */
const createVariantImages = async (
  tx,
  variantId,
  images = []
) => {
  if (!images || images.length === 0) {
    return;
  }

  await tx.productVariantImage.createMany({
    data: images.map((image) => ({
      url: image.url,
      publicId: image.publicId,
      variantId,
    })),
  });
};

/**
 * Crea las variantes y sus imágenes.
 */
const createProductVariants = async (
  tx,
  productId,
  variants = []
) => {
  for (const variant of variants) {
    const createdVariant =
      await tx.productVariant.create({
        data: {
          productId,
          name: variant.name,
          colorHex: variant.colorHex ?? null,
          stock: variant.stock,
          sku: variant.sku ?? null,
        },
      });

    await createVariantImages(
      tx,
      createdVariant.id,
      variant.images
    );
  }
};

const createProduct = async (data) => {
  const {
    images,
    variants,
    ...productData
  } = data;

  const hasVariants =
    productData.hasVariants === true;

  // El stock clásico es independiente de las variantes.
  // Compatibilidad: si no llega baseStock, usamos stock
  // cuando el producto no tiene variantes.
  const baseStock = Number(
    productData.baseStock ??
      (hasVariants ? 0 : productData.stock ?? 0)
  );

  productData.baseStock = baseStock;

  const variantsStock = hasVariants
    ? getVariantsStock(variants)
    : 0;

  // Stock general = clásico + variantes.
  productData.stock = baseStock + variantsStock;

  const mainImage =
    productData.image ||
    images?.[0]?.url ||
    null;

  productData.image = mainImage;

  return await prisma.$transaction(async (tx) => {
    productData.slug = await getUniqueSlug(
      tx,
      productData.slug
    );

    const product = await tx.product.create({
      data: productData,
    });

    if (images && images.length > 0) {
      await tx.productImage.createMany({
        data: images.map((image) => ({
          url: image.url,
          publicId: image.publicId,
          productId: product.id,
        })),
      });
    }

    if (
      hasVariants &&
      variants &&
      variants.length > 0
    ) {
      await createProductVariants(
        tx,
        product.id,
        variants
      );
    }

    return await tx.product.findUnique({
      where: {
        id: product.id,
      },

      include: {
        category: true,
        brand: true,
        images: true,

        variants: {
          include: {
            images: true,
          },

          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  });
};

const getProducts = async ({
  page = 1,
  limit = 10,
  search,
  categoryId,
  brandId,
  offerActive,
  sort,
}) => {
  const skip = (page - 1) * limit;

  const searchTerms = normalizeSearch(search);

  const where = {
    ...(searchTerms.length > 0 && {
      OR: searchTerms.flatMap((term) => [
        {
          name: {
            contains: term,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: term,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: term,
            mode: "insensitive",
          },
        },
        {
          category: {
            name: {
              contains: term,
              mode: "insensitive",
            },
          },
        },
        {
          brand: {
            name: {
              contains: term,
              mode: "insensitive",
            },
          },
        },
      ]),
    }),

    ...(categoryId && {
      categoryId,
    }),

    ...(brandId && {
      brandId,
    }),

    ...(offerActive !== undefined && {
      offerActive,
    }),
  };

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : sort === "newest"
      ? { createdAt: "desc" }
      : undefined;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      where,
      orderBy,

      include: {
        category: true,
        brand: true,
        images: true,

        variants: {
          include: {
            images: true,
          },

          orderBy: {
            createdAt: "asc",
          },
        },

        reviews: {
          select: {
            rating: true,
          },
        },
      },
    }),

    prisma.product.count({
      where,
    }),
  ]);

  return {
    products,
    total,
  };
};

const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: {
      id,
    },

    include: {
      category: true,
      brand: true,
      images: true,

      variants: {
        include: {
          images: true,
        },

        orderBy: {
          createdAt: "asc",
        },
      },

      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });
};


const updateProduct = async (id, data) => {
  const {
    images,
    variants,
    ...productData
  } = data;


  return await prisma.$transaction(async (tx) => {
    const existingProduct =
      await tx.product.findUnique({
        where: {
          id,
        },

        select: {
          baseStock: true,
          hasVariants: true,
        },
      });

    if (!existingProduct) {
      throw new Error("Producto no encontrado.");
    }

    // Conservamos la configuración actual si no fue enviada.
    const hasVariants =
      productData.hasVariants ??
      existingProduct.hasVariants;

    // El stock base se actualiza únicamente cuando llega
    // un nuevo valor; de lo contrario, conserva el existente.
    const baseStock = Number(
      productData.baseStock ??
        existingProduct.baseStock
    );

    let variantsStock = 0;

    if (hasVariants) {
      if (variants !== undefined) {
        variantsStock = getVariantsStock(variants);
      } else {
        const currentVariantsStock =
          await tx.productVariant.aggregate({
            where: {
              productId: id,
            },

            _sum: {
              stock: true,
            },
          });

        variantsStock =
          currentVariantsStock._sum.stock ?? 0;
      }
    }

    // Stock total = stock base + stock de variantes.
    productData.stock = baseStock + variantsStock;

    // Persistimos el stock base normalizado.
    if (productData.baseStock !== undefined) {
      productData.baseStock = baseStock;
    }

    const product = await tx.product.update({
      where: {
        id,
      },

      data: productData,
    });

    // Actualización de imágenes principales.
    if (images !== undefined) {
      await tx.productImage.deleteMany({
        where: {
          productId: id,
        },
      });

      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((image) => ({
            url: image.url,
            publicId: image.publicId,
            productId: id,
          })),
        });
      }
    }

    // Reemplazamos las variantes solamente si
    // el frontend envió explícitamente el array.
    if (variants !== undefined) {
      await tx.productVariant.deleteMany({
        where: {
          productId: id,
        },
      });

      if (variants.length > 0) {
        await createProductVariants(
          tx,
          id,
          variants
        );
      }
    }

    return await tx.product.findUnique({
      where: {
        id: product.id,
      },

      include: {
        category: true,
        brand: true,
        images: true,

        variants: {
          include: {
            images: true,
          },

          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  });
};


const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: {
      id,
    },
  });
};


const getProductByIdForOrder = async (id) => {
  return await prisma.product.findUnique({
    where: {
      id,
    },

    include: {
      variants: {
        include: {
          images: true,
        },
      },
    },
  });
};



const decreaseStock = async (id, quantity) => {
  return await prisma.product.update({
    where: {
      id,
    },

    data: {
      stock: {
        decrement: quantity,
      },
    },
  });
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByIdForOrder,
  decreaseStock,
};

