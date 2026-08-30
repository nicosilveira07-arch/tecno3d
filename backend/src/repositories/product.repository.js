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

const createProduct = async (data) => {
  const { images, ...productData } = data;

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

    return await tx.product.findUnique({
      where: {
        id: product.id,
      },
      include: {
        category: true,
        brand: true,
        images: true,
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
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });
};

const updateProduct = async (id, data) => {
  const { images, ...productData } = data;

  if (images !== undefined) {
    productData.image =
      images.length > 0
        ? images[0].url
        : null;
  }

  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: {
        id,
      },
      data: productData,
    });

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

    return await tx.product.findUnique({
      where: {
        id: product.id,
      },
      include: {
        category: true,
        brand: true,
        images: true,
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

