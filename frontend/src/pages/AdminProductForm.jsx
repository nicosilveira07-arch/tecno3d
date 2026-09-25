import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createProduct,
  getProductById,
  updateProduct,
} from "@/services/products.api";

import { uploadImage } from "@/services/upload.api";
import { getCategories } from "@/services/categories.api";
import { getBrands } from "@/services/brands.api";

const createEmptyVariant = () => ({
  name: "",
  colorHex: "#000000",
  stock: "0",
  sku: "",
  images: [],
});

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    offerPrice: "",
    offerPercentage: "",
    offerActive: false,

    stock: "",
    hasVariants: false,
    variants: [],

    image: "",
    images: [],

    categoryId: "",
    brandId: "",
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [imagePreview, setImagePreview] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);

  const [uploadingVariantImage, setUploadingVariantImage] =
    useState(null);

  const [loading, setLoading] = useState(false);

  const [loadingData, setLoadingData] = useState(isEditMode);

  const [loadingOptions, setLoadingOptions] = useState(true);

  const [error, setError] = useState("");

  // ======================================================
  // CARGAR DATOS
  // ======================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(isEditMode);
        setLoadingOptions(true);
        setError("");

        const promises = [
          getCategories(),
          getBrands(),
        ];

        if (isEditMode) {
          promises.push(getProductById(id));
        }

        const responses = await Promise.all(promises);

        const categoriesResponse = responses[0];
        const brandsResponse = responses[1];

        setCategories(categoriesResponse.data || []);
        setBrands(brandsResponse.data || []);

        if (isEditMode) {
          const productResponse = responses[2];
          const product = productResponse.data;

          if (!product) {
            throw new Error(
              "No se encontró el producto."
            );
          }

          const productImages = product.images || [];
          const productVariants = product.variants || [];

          setForm({
            name: product.name || "",
            slug: product.slug || "",
            description: product.description || "",

            price: product.price?.toString() || "",

            offerPrice:
              product.offerPrice?.toString() || "",

            offerPercentage:
              product.offerPercentage?.toString() || "",

            offerActive: Boolean(product.offerActive),

            stock: product.stock?.toString() || "",

            hasVariants: Boolean(product.hasVariants),

            variants: productVariants.map(
              (variant) => ({
                name: variant.name || "",

                colorHex:
                  variant.colorHex || "#000000",

                stock:
                  variant.stock?.toString() || "0",

                sku: variant.sku || "",

                images: (variant.images || []).map(
                  (image) => ({
                    url: image.url,
                    publicId: image.publicId || "",
                  })
                ),
              })
            ),

            image: product.image || "",

            images: productImages.map(
              (image) => ({
                url: image.url,
                publicId: image.publicId || "",
              })
            ),

            categoryId: product.categoryId || "",

            brandId: product.brandId || "",
          });

          setImagePreview(
            product.image ||
              productImages[0]?.url ||
              ""
          );
        }
      } catch (error) {
        console.error(
          "ERROR CARGANDO PRODUCTO:",
          error
        );

        setError(
          error.response?.data?.message ||
            error.message ||
            "No se pudieron cargar los datos."
        );
      } finally {
        setLoadingData(false);
        setLoadingOptions(false);
      }
    };

    loadData();
  }, [id, isEditMode]);

  // ======================================================
  // SLUG
  // ======================================================

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // ======================================================
  // CAMPOS GENERALES
  // ======================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,

      ...(name === "name" && !isEditMode
        ? {
            slug: generateSlug(value),
          }
        : {}),
    }));
  };

  // ======================================================
  // OFERTA
  // ======================================================

  const handleOfferToggle = (event) => {
    const active = event.target.checked;

    setForm((prev) => ({
      ...prev,
      offerActive: active,

      ...(active
        ? {}
        : {
            offerPrice: "",
            offerPercentage: "",
          }),
    }));
  };

  const handleOfferPercentageChange = (
    event
  ) => {
    const value = event.target.value;

    setForm((prev) => {
      const percentage = Number(value);
      const price = Number(prev.price);

      if (
        !value ||
        !price ||
        percentage <= 0
      ) {
        return {
          ...prev,
          offerPercentage: value,
          offerPrice: "",
        };
      }

      const calculatedPrice =
        price -
        (price * percentage) / 100;

      return {
        ...prev,
        offerPercentage: value,
        offerPrice:
          calculatedPrice.toFixed(2),
      };
    });
  };

  // ======================================================
  // IMÁGENES NORMALES DEL PRODUCTO
  // ======================================================

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) {
      return;
    }

    const selectedFiles = Array.from(files);

    const invalidFile =
      selectedFiles.find(
        (file) =>
          !file.type.startsWith("image/")
      );

    if (invalidFile) {
      setError(
        "Todos los archivos seleccionados deben ser imágenes."
      );

      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      for (const file of selectedFiles) {
        const previewUrl =
          URL.createObjectURL(file);

        setImagePreview(
          (currentPreview) =>
            currentPreview || previewUrl
        );

        const response =
          await uploadImage(file);

        const uploadedImage =
          response?.data?.[0];

        const imageUrl =
          uploadedImage?.url ||
          uploadedImage?.secure_url ||
          response?.data?.url ||
          response?.data?.imageUrl ||
          response?.url ||
          response?.imageUrl;

        const publicId =
          uploadedImage?.publicId ||
          uploadedImage?.public_id ||
          "";

        if (!imageUrl) {
          throw new Error(
            "El servidor no devolvió la URL de la imagen."
          );
        }

        const newImage = {
          url: imageUrl,
          publicId,
        };

        setForm((prev) => {
          const updatedImages = [
            ...prev.images,
            newImage,
          ];

          return {
            ...prev,
            images: updatedImages,
            image:
              prev.image ||
              imageUrl,
          };
        });

        setImagePreview(
          (currentPreview) =>
            currentPreview || imageUrl
        );
      }
    } catch (error) {
      console.error(
        "ERROR SUBIENDO IMAGEN:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "No se pudo subir la imagen."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (event) => {
    const files = event.target.files;

    handleImageUpload(files);

    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const files =
      event.dataTransfer.files;

    handleImageUpload(files);
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => {
      const updatedImages =
        prev.images.filter(
          (_, imageIndex) =>
            imageIndex !== index
        );

      return {
        ...prev,
        images: updatedImages,

        image:
          updatedImages[0]?.url || "",
      };
    });

    setImagePreview(() => {
      const remainingImages =
        form.images.filter(
          (_, imageIndex) =>
            imageIndex !== index
        );

      return (
        remainingImages[0]?.url || ""
      );
    });
  };

  const handleSelectMainImage = (image) => {
    setForm((prev) => ({
      ...prev,
      image: image.url,
    }));

    setImagePreview(image.url);
  };

  // ======================================================
  // VARIANTES
  // ======================================================

  const handleVariantsToggle = (event) => {
    const hasVariants =
      event.target.checked;

    setForm((prev) => ({
      ...prev,

      hasVariants,

      variants:
        hasVariants
          ? prev.variants.length > 0
            ? prev.variants
            : [createEmptyVariant()]
          : prev.variants,
    }));
  };

  const handleAddVariant = () => {
    setForm((prev) => ({
      ...prev,

      variants: [
        ...prev.variants,
        createEmptyVariant(),
      ],
    }));
  };

  const handleRemoveVariant = (index) => {
    setForm((prev) => ({
      ...prev,

      variants:
        prev.variants.filter(
          (_, variantIndex) =>
            variantIndex !== index
        ),
    }));
  };

  const handleVariantChange = (
    index,
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,

      variants:
        prev.variants.map(
          (
            variant,
            variantIndex
          ) =>
            variantIndex === index
              ? {
                  ...variant,
                  [field]: value,
                }
              : variant
        ),
    }));
  };

  const handleVariantImageUpload =
    async (
      files,
      variantIndex
    ) => {
      if (
        !files ||
        files.length === 0
      ) {
        return;
      }

      const selectedFiles =
        Array.from(files);

      const invalidFile =
        selectedFiles.find(
          (file) =>
            !file.type.startsWith(
              "image/"
            )
        );

      if (invalidFile) {
        setError(
          "Todos los archivos seleccionados deben ser imágenes."
        );

        return;
      }

      try {
        setUploadingVariantImage(
          variantIndex
        );

        setError("");

        for (
          const file of selectedFiles
        ) {
          const response =
            await uploadImage(file);

          const uploadedImage =
            response?.data?.[0];

          const imageUrl =
            uploadedImage?.url ||
            uploadedImage?.secure_url ||
            response?.data?.url ||
            response?.data?.imageUrl ||
            response?.url ||
            response?.imageUrl;

          const publicId =
            uploadedImage?.publicId ||
            uploadedImage?.public_id ||
            "";

          if (!imageUrl) {
            throw new Error(
              "El servidor no devolvió la URL de la imagen."
            );
          }

          const newImage = {
            url: imageUrl,
            publicId,
          };

          setForm((prev) => ({
            ...prev,

            variants:
              prev.variants.map(
                (
                  variant,
                  index
                ) =>
                  index === variantIndex
                    ? {
                        ...variant,

                        images: [
                          ...variant.images,
                          newImage,
                        ],
                      }
                    : variant
              ),
          }));
        }
      } catch (error) {
        console.error(
          "ERROR SUBIENDO IMAGEN DE VARIANTE:",
          error
        );

        setError(
          error.response?.data?.message ||
            error.message ||
            "No se pudo subir la imagen de la variante."
        );
      } finally {
        setUploadingVariantImage(
          null
        );
      }
    };

  const handleVariantFileChange = (
    event,
    variantIndex
  ) => {
    const files =
      event.target.files;

    handleVariantImageUpload(
      files,
      variantIndex
    );

    event.target.value = "";
  };

  const handleVariantDrop = (
    event,
    variantIndex
  ) => {
    event.preventDefault();

    const files =
      event.dataTransfer.files;

    handleVariantImageUpload(
      files,
      variantIndex
    );
  };

  const handleRemoveVariantImage = (
    variantIndex,
    imageIndex
  ) => {
    setForm((prev) => ({
      ...prev,

      variants:
        prev.variants.map(
          (
            variant,
            index
          ) =>
            index === variantIndex
              ? {
                  ...variant,

                  images:
                    variant.images.filter(
                      (
                        _,
                        currentImageIndex
                      ) =>
                        currentImageIndex !==
                        imageIndex
                    ),
                }
              : variant
        ),
    }));
  };

  const totalVariantStock =
    useMemo(() => {
      return form.variants.reduce(
        (total, variant) =>
          total +
          Number(
            variant.stock || 0
          ),
        0
      );
    }, [form.variants]);

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (uploadingImage) {
        setError(
          "Esperá a que terminen de subir las imágenes."
        );

        return;
      }

      if (
        uploadingVariantImage !==
        null
      ) {
        setError(
          "Esperá a que terminen de subir las imágenes de las variantes."
        );

        return;
      }

      if (!form.categoryId) {
        setError(
          "Seleccioná una categoría."
        );

        return;
      }

      if (!form.brandId) {
        setError(
          "Seleccioná una marca."
        );

        return;
      }

      if (form.offerActive) {
        const offerPercentage =
          Number(
            form.offerPercentage
          );

        const offerPrice =
          Number(
            form.offerPrice
          );

        const price =
          Number(form.price);

        if (
          !offerPercentage ||
          offerPercentage <= 0 ||
          offerPercentage >= 100
        ) {
          setError(
            "Ingresá un porcentaje de oferta válido."
          );

          return;
        }

        if (
          !offerPrice ||
          offerPrice <= 0 ||
          offerPrice >= price
        ) {
          setError(
            "El precio de oferta debe ser menor al precio original."
          );

          return;
        }
      }

      if (
        form.hasVariants &&
        form.variants.length === 0
      ) {
        setError(
          "Agregá al menos una variante de color."
        );

        return;
      }

      if (form.hasVariants) {
        const invalidVariant =
          form.variants.find(
            (variant) =>
              !variant.name.trim()
          );

        if (invalidVariant) {
          setError(
            "Todas las variantes deben tener un nombre."
          );

          return;
        }

        const duplicatedNames =
          form.variants.some(
            (
              variant,
              index
            ) =>
              form.variants.findIndex(
                (other) =>
                  other.name
                    .trim()
                    .toLowerCase() ===
                  variant.name
                    .trim()
                    .toLowerCase()
              ) !== index
          );

        if (duplicatedNames) {
          setError(
            "No podés tener dos variantes con el mismo nombre."
          );

          return;
        }
      }

      const finalStock =
        form.hasVariants
          ? totalVariantStock
          : Number(form.stock);

      const data = {
        name: form.name,

        slug: form.slug,

        description:
          form.description,

        price:
          Number(form.price),

        offerPrice:
          form.offerActive &&
          form.offerPrice
            ? Number(
                form.offerPrice
              )
            : null,

        offerPercentage:
          form.offerActive &&
          form.offerPercentage
            ? Number(
                form.offerPercentage
              )
            : null,

        offerActive:
          Boolean(
            form.offerActive
          ),

        stock: finalStock,

        hasVariants:
          Boolean(
            form.hasVariants
          ),

        variants:
          form.hasVariants
            ? form.variants.map(
                (variant) => ({
                  name:
                    variant.name.trim(),

                  colorHex:
                    variant.colorHex ||
                    null,

                  stock:
                    Number(
                      variant.stock ||
                        0
                    ),

                  sku:
                    variant.sku
                      ?.trim() ||
                    null,

                  images:
                    variant.images ||
                    [],
                })
              )
            : [],

        // LAS IMÁGENES NORMALES SIEMPRE SE GUARDAN
        image:
          form.image ||
          form.images[0]?.url ||
          null,

        images:
          form.images,

        categoryId:
          form.categoryId,

        brandId:
          form.brandId,
      };

      console.log(
        "DATOS PRODUCTO:",
        data
      );

      if (isEditMode) {
        await updateProduct(
          id,
          data
        );
      } else {
        await createProduct(
          data
        );
      }

      navigate(
        "/admin/products"
      );
    } catch (error) {
      console.error(
        isEditMode
          ? "ERROR ACTUALIZANDO PRODUCTO:"
          : "ERROR CREANDO PRODUCTO:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          (isEditMode
            ? "No se pudo actualizar el producto."
            : "No se pudo crear el producto.")
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loadingData) {
    return (
      <div className="p-8 text-white">
        Cargando producto...
      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div>
      {/* ENCABEZADO */}

      <div>
        <p className="mb-2 text-sm font-semibold text-red-500">
          Administración
        </p>

        <h1 className="text-3xl font-black text-white md:text-4xl">
          {isEditMode
            ? "Editar producto"
            : "Agregar producto"}
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          {isEditMode
            ? "Modificá los datos del producto."
            : "Completá los datos del producto para agregarlo al catálogo."}
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* FORMULARIO */}

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 md:grid-cols-2"
        >
          {/* NOMBRE */}

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Nombre del producto
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={
                handleChange
              }
              required
              placeholder="Ej: PC Gamer"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
            />
          </div>

          {/* SLUG */}

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Identificador web
            </label>

            <input
              type="text"
              name="slug"
              value={form.slug}
              readOnly
              placeholder="Se genera automáticamente"
              className="w-full cursor-not-allowed rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-500 outline-none"
            />

            <p className="mt-1 text-xs text-zinc-600">
              Identificador único del producto.
            </p>
          </div>

          {/* PRECIO */}

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Precio original
            </label>

            <input
              type="number"
              name="price"
              value={form.price}
              onChange={
                handleChange
              }
              min="0"
              step="0.01"
              required
              placeholder="Ej: 25000"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
            />
          </div>

          {/* STOCK + VARIANTES */}

          <div>
            {!form.hasVariants && (
              <>
                <label className="mb-2 block text-sm text-zinc-400">
                  Stock disponible
                </label>

                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={
                    handleChange
                  }
                  min="0"
                  required
                  placeholder="Ej: 10"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
                />
              </>
            )}

            {form.hasVariants && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">
                  Stock total de variantes
                </p>

                <p className="mt-1 text-2xl font-black text-green-400">
                  {totalVariantStock}
                </p>
              </div>
            )}
          </div>

          {/* VARIANTES */}

          <div className="md:col-span-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Variantes por color
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    Opcional. Activá esta opción solamente si el producto tiene diferentes colores.
                  </p>
                </div>

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      form.hasVariants
                    }
                    onChange={
                      handleVariantsToggle
                    }
                    className="h-5 w-5 accent-red-600"
                  />

                  <span className="font-semibold text-white">
                    Este producto tiene variantes por color
                  </span>
                </label>

              </div>

              {form.hasVariants && (
                <div className="mt-5 border-t border-zinc-800 pt-5">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="font-semibold text-white">
                        Colores del producto
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Cada color puede tener stock, SKU e imágenes diferentes.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleAddVariant
                      }
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                    >
                      + Agregar color
                    </button>

                  </div>

                  <div className="mt-5 space-y-5">

                    {form.variants.map(
                      (
                        variant,
                        index
                      ) => (
                        <div
                          key={`variant-${index}`}
                          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                        >

                          <div className="mb-5 flex items-center justify-between">

                            <h4 className="font-bold text-white">
                              Variante{" "}
                              {index + 1}
                            </h4>

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveVariant(
                                  index
                                )
                              }
                              className="rounded-lg px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-950/40"
                            >
                              Eliminar
                            </button>

                          </div>

                          <div className="grid gap-4 md:grid-cols-3">

                            {/* NOMBRE */}

                            <div>
                              <label className="mb-2 block text-sm text-zinc-400">
                                Color
                              </label>

                              <input
                                type="text"
                                value={
                                  variant.name
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleVariantChange(
                                    index,
                                    "name",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Ej: Azul"
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
                              />
                            </div>

                            {/* COLOR VISUAL */}

                            <div>
                              <label className="mb-2 block text-sm text-zinc-400">
                                Color visual
                              </label>

                              <div className="flex gap-3">

                                <input
                                  type="color"
                                  value={
                                    variant.colorHex ||
                                    "#000000"
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    handleVariantChange(
                                      index,
                                      "colorHex",
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                  className="h-12 w-16 cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950"
                                />

                                <input
                                  type="text"
                                  value={
                                    variant.colorHex ||
                                    ""
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    handleVariantChange(
                                      index,
                                      "colorHex",
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                  placeholder="#000000"
                                  className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
                                />

                              </div>
                            </div>

                            {/* STOCK */}

                            <div>
                              <label className="mb-2 block text-sm text-zinc-400">
                                Stock
                              </label>

                              <input
                                type="number"
                                min="0"
                                value={
                                  variant.stock
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleVariantChange(
                                    index,
                                    "stock",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Ej: 10"
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
                              />
                            </div>

                            {/* SKU */}

                            <div className="md:col-span-3">

                              <label className="mb-2 block text-sm text-zinc-400">
                                SKU de la variante
                              </label>

                              <input
                                type="text"
                                value={
                                  variant.sku
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleVariantChange(
                                    index,
                                    "sku",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Ej: MATERA-AZUL"
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
                              />

                            </div>

                            {/* IMÁGENES DE VARIANTE */}

                            <div className="md:col-span-3">

                              <label className="mb-2 block text-sm text-zinc-400">
                                Imágenes de{" "}
                                {variant.name ||
                                  "este color"}
                              </label>

                              <label
                                onDragOver={(
                                  event
                                ) =>
                                  event.preventDefault()
                                }
                                onDrop={(
                                  event
                                ) =>
                                  handleVariantDrop(
                                    event,
                                    index
                                  )
                                }
                                className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-950 p-5 text-center transition hover:border-red-600 hover:bg-zinc-900"
                              >

                                <div className="mb-3 text-3xl">
                                  🎨
                                </div>

                                <p className="font-semibold text-white">
                                  Imágenes de esta variante
                                </p>

                                <p className="mt-1 text-sm text-zinc-500">
                                  Arrastrá imágenes o hacé clic para seleccionarlas.
                                </p>

                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/jpg,image/webp"
                                  multiple
                                  onChange={(
                                    event
                                  ) =>
                                    handleVariantFileChange(
                                      event,
                                      index
                                    )
                                  }
                                  className="hidden"
                                />

                              </label>

                              {uploadingVariantImage ===
                                index && (
                                <p className="mt-3 text-sm text-zinc-400">
                                  Subiendo imágenes de la variante...
                                </p>
                              )}

                              {variant.images?.length >
                                0 && (
                                <div className="mt-4">

                                  <p className="mb-3 text-sm font-semibold text-zinc-300">
                                    Imágenes cargadas:{" "}
                                    {
                                      variant
                                        .images
                                        .length
                                    }
                                  </p>

                                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">

                                    {variant.images.map(
                                      (
                                        image,
                                        imageIndex
                                      ) => (
                                        <div
                                          key={`${image.url}-${imageIndex}`}
                                          className="relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950"
                                        >

                                          <img
                                            src={
                                              image.url
                                            }
                                            alt={`${variant.name || "Variante"} ${
                                              imageIndex +
                                              1
                                            }`}
                                            className="h-28 w-full object-cover"
                                          />

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveVariantImage(
                                                index,
                                                imageIndex
                                              )
                                            }
                                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-sm font-bold text-white hover:bg-red-600"
                                          >
                                            ×
                                          </button>

                                        </div>
                                      )
                                    )}

                                  </div>
                                </div>
                              )}

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                  {form.variants.length ===
                    0 && (
                    <div className="mt-5 rounded-xl border border-dashed border-zinc-700 p-6 text-center">

                      <p className="text-sm text-zinc-500">
                        Todavía no agregaste ningún color.
                      </p>

                      <button
                        type="button"
                        onClick={
                          handleAddVariant
                        }
                        className="mt-3 rounded-xl bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-700"
                      >
                        Agregar primer color
                      </button>

                    </div>
                  )}

                  {form.variants.length >
                    0 && (
                    <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900 p-4">

                      <div className="flex items-center justify-between">

                        <span className="text-sm text-zinc-400">
                          Stock total
                        </span>

                        <span className="text-xl font-black text-green-400">
                          {
                            totalVariantStock
                          }
                        </span>

                      </div>

                      <p className="mt-1 text-xs text-zinc-600">
                        El stock general se calcula automáticamente sumando los stocks de los colores.
                      </p>

                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

          {/* OFERTA */}

          <div className="md:col-span-2">

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                  <h3 className="text-lg font-bold text-white">
                    Oferta del producto
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    Activá una oferta para mostrar un precio promocional.
                  </p>

                </div>

                <label className="flex cursor-pointer items-center gap-3">

                  <input
                    type="checkbox"
                    checked={
                      form.offerActive
                    }
                    onChange={
                      handleOfferToggle
                    }
                    className="h-5 w-5 accent-red-600"
                  />

                  <span className="font-semibold text-white">
                    Producto en oferta
                  </span>

                </label>

              </div>

              {form.offerActive && (
                <div className="mt-5 grid gap-5 border-t border-zinc-800 pt-5 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm text-zinc-400">
                      Descuento
                    </label>

                    <div className="relative">

                      <input
                        type="number"
                        value={
                          form.offerPercentage
                        }
                        onChange={
                          handleOfferPercentageChange
                        }
                        min="1"
                        max="99"
                        step="1"
                        placeholder="Ej: 40"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 pr-12 text-white outline-none focus:border-red-600"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-red-500">
                        %
                      </span>

                    </div>

                    <p className="mt-1 text-xs text-zinc-600">
                      Ejemplo: 40% de descuento.
                    </p>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm text-zinc-400">
                      Precio de oferta
                    </label>

                    <input
                      type="number"
                      value={
                        form.offerPrice
                      }
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-green-400 outline-none"
                    />

                    <p className="mt-1 text-xs text-zinc-600">
                      Se calcula automáticamente.
                    </p>

                  </div>

                  {form.price &&
                    form.offerPrice && (
                      <div className="md:col-span-2">

                        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4">

                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-500">
                            Vista previa
                          </p>

                          <div className="flex flex-wrap items-center gap-3">

                            <span className="text-lg text-zinc-500 line-through">
                              UYU{" "}
                              {Number(
                                form.price
                              ).toLocaleString(
                                "es-UY"
                              )}
                            </span>

                            <span className="text-2xl font-black text-green-400">
                              UYU{" "}
                              {Number(
                                form.offerPrice
                              ).toLocaleString(
                                "es-UY"
                              )}
                            </span>

                            <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-black text-white">
                              -
                              {
                                form.offerPercentage
                              }
                              %
                            </span>

                          </div>

                        </div>

                      </div>
                    )}

                </div>
              )}

            </div>

          </div>

          {/* CATEGORÍA */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Categoría
            </label>

            <select
              name="categoryId"
              value={
                form.categoryId
              }
              onChange={
                handleChange
              }
              required
              disabled={
                loadingOptions
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <option value="">
                {loadingOptions
                  ? "Cargando categorías..."
                  : "Seleccioná una categoría"}
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                )
              )}

            </select>

          </div>

          {/* MARCA */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Marca
            </label>

            <select
              name="brandId"
              value={
                form.brandId
              }
              onChange={
                handleChange
              }
              required
              disabled={
                loadingOptions
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <option value="">
                {loadingOptions
                  ? "Cargando marcas..."
                  : "Seleccioná una marca"}
              </option>

              {brands.map(
                (brand) => (
                  <option
                    key={
                      brand.id
                    }
                    value={
                      brand.id
                    }
                  >
                    {
                      brand.name
                    }
                  </option>
                )
              )}

            </select>

          </div>

          {/* IMÁGENES NORMALES
              AHORA SIEMPRE DISPONIBLES */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm text-zinc-400">
              Imágenes del producto
            </label>

            <label
              onDragOver={(event) =>
                event.preventDefault()
              }
              onDrop={handleDrop}
              className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-950 p-6 text-center transition hover:border-red-600 hover:bg-zinc-900"
            >

              <div className="mb-4 text-4xl">
                🖼️
              </div>

              <p className="font-semibold text-white">
                Arrastrá imágenes acá
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                o hacé clic para seleccionar una o varias imágenes
              </p>

              <p className="mt-2 text-xs text-zinc-600">
                PNG, JPG, JPEG o WEBP
              </p>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                onChange={
                  handleFileChange
                }
                className="hidden"
              />

            </label>

            {form.images.length >
              0 && (
              <div className="mt-5">

                <p className="mb-3 text-sm font-semibold text-zinc-300">
                  Imágenes cargadas:{" "}
                  {
                    form.images.length
                  }
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">

                  {form.images.map(
                    (
                      image,
                      index
                    ) => (
                      <div
                        key={`${image.url}-${index}`}
                        className="relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950"
                      >

                        <button
                          type="button"
                          onClick={() =>
                            handleSelectMainImage(
                              image
                            )
                          }
                          className={`block w-full ${
                            form.image ===
                            image.url
                              ? "ring-2 ring-red-600"
                              : ""
                          }`}
                        >

                          <img
                            src={
                              image.url
                            }
                            alt={`Imagen ${
                              index +
                              1
                            }`}
                            className="h-28 w-full object-cover"
                          />

                        </button>

                        {form.image ===
                          image.url && (
                          <div className="absolute bottom-0 left-0 right-0 bg-red-600 px-2 py-1 text-center text-xs font-bold text-white">
                            Principal
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveImage(
                              index
                            )
                          }
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-sm font-bold text-white hover:bg-red-600"
                        >
                          ×
                        </button>

                      </div>
                    )
                  )}

                </div>

                {uploadingImage && (
                  <p className="mt-3 text-sm text-zinc-400">
                    Subiendo imágenes...
                  </p>
                )}

              </div>
            )}

          </div>

          {/* DESCRIPCIÓN */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm text-zinc-400">
              Descripción
            </label>

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={
                handleChange
              }
              required
              rows={5}
              placeholder="Describí las características principales del producto..."
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
            />

          </div>

          {/* BOTONES */}

          <div className="flex gap-3 md:col-span-2">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/products"
                )
              }
              className="flex-1 rounded-xl border border-zinc-700 py-3 font-bold text-zinc-300 transition hover:bg-zinc-800"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                uploadingImage ||
                uploadingVariantImage !==
                  null ||
                loadingOptions
              }
              className="flex-1 rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
            >
              {uploadingImage ||
              uploadingVariantImage !==
                null
                ? "Subiendo imágenes..."
                : loading
                ? isEditMode
                  ? "Guardando cambios..."
                  : "Creando producto..."
                : isEditMode
                ? "Guardar cambios"
                : "Crear producto"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

