import { useEffect, useState } from "react";

import {
  ShoppingCart,
  Tag,
  ArrowLeft,
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { getProductById } from "@/services/products.api";

import {
  getProductReviews,
  createProductReview,
  deleteProductReview,
} from "@/services/reviews.api";

import { addToCart } from "@/features/cart/cart.store";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [error, setError] = useState("");

  const [added, setAdded] = useState(false);

  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");

  const [submittingReview, setSubmittingReview] =
    useState(false);

  const [deletingReviewId, setDeletingReviewId] =
    useState(null);

  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] =
    useState("");

  const [user, setUser] = useState(null);

  const [selectedImageIndex, setSelectedImageIndex] =
    useState(0);

  // ======================================================
  // VARIANTE SELECCIONADA
  // ======================================================
  //
  // null = producto base / "Sin color"
  //
  // Si el cliente selecciona una variante:
  // selectedVariant = esa variante.
  //
  const [selectedVariant, setSelectedVariant] =
    useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // ======================================================
  // CARGAR PRODUCTO
  // ======================================================

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const result = await getProductById(id);

        const loadedProduct = result.data;

        setProduct(loadedProduct);

        setSelectedImageIndex(0);

        // ==================================================
        // IMPORTANTE:
        // INICIAMOS EN EL PRODUCTO BASE
        //
        // null = "Sin color"
        //
        // Así se muestran primero las imágenes normales
        // del producto.
        // ==================================================

        setSelectedVariant(null);
      } catch (error) {
        console.error(
          "ERROR CARGANDO PRODUCTO:",
          error
        );

        setError(
          error.response?.data?.message ||
            "No se pudo cargar el producto."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  // ======================================================
  // RESEÑAS
  // ======================================================

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);

      const result = await getProductReviews(id);

      setReviews(
        result.data?.data?.reviews || []
      );

      setAverageRating(
        result.data?.data?.averageRating || 0
      );

      setTotalReviews(
        result.data?.data?.totalReviews || 0
      );
    } catch (error) {
      console.error(
        "ERROR CARGANDO RESEÑAS:",
        error
      );

      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadReviews();
    }
  }, [id]);

  // ======================================================
  // CAMBIAR VARIANTE
  // ======================================================

  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant);

    setSelectedImageIndex(0);

    setAdded(false);
  };

  // ======================================================
  // SELECCIONAR PRODUCTO BASE
  // ======================================================

  const handleSelectBaseProduct = () => {
    // null representa "Sin color"
    setSelectedVariant(null);

    // Volvemos a la primera imagen normal
    setSelectedImageIndex(0);

    setAdded(false);
  };

  // ======================================================
  // GALERÍA
  // ======================================================

  const galleryImages = (() => {
    if (!product) {
      return [];
    }

    // ====================================================
    // VARIANTE SELECCIONADA
    // ====================================================

    if (
      product.hasVariants &&
      selectedVariant
    ) {
      const images = [];

      if (
        Array.isArray(
          selectedVariant.images
        )
      ) {
        selectedVariant.images.forEach(
          (image) => {
            if (!image?.url) {
              return;
            }

            images.push({
              url: image.url,
              publicId:
                image.publicId || null,
            });
          }
        );
      }

      return images;
    }

    // ====================================================
    // PRODUCTO BASE / SIN COLOR
    // ====================================================

    const images = [];

    if (product.image) {
      images.push({
        url: product.image,
        publicId: null,
      });
    }

    if (Array.isArray(product.images)) {
      product.images.forEach(
        (image) => {
          if (!image?.url) {
            return;
          }

          if (
            image.url ===
            product.image
          ) {
            return;
          }

          images.push({
            url: image.url,
            publicId:
              image.publicId || null,
          });
        }
      );
    }

    return images;
  })();

  // ======================================================
  // IMAGEN SELECCIONADA
  // ======================================================

  const selectedImage =
    galleryImages[
      selectedImageIndex
    ]?.url ||
    galleryImages[0]?.url ||
    product?.image ||
    "";

  // ======================================================
  // STOCK ACTUAL
  // ======================================================

  const currentStock =
    product?.hasVariants &&
    selectedVariant
      ? Number(
          selectedVariant.stock || 0
        )
      : Number(
          product?.stock || 0
        );

  const hasStock =
    currentStock > 0;

  // ======================================================
  // GALERÍA - ANTERIOR
  // ======================================================

  const handlePreviousImage = () => {
    if (
      galleryImages.length <= 1
    ) {
      return;
    }

    setSelectedImageIndex(
      (currentIndex) =>
        currentIndex === 0
          ? galleryImages.length - 1
          : currentIndex - 1
    );
  };

  // ======================================================
  // GALERÍA - SIGUIENTE
  // ======================================================

  const handleNextImage = () => {
    if (
      galleryImages.length <= 1
    ) {
      return;
    }

    setSelectedImageIndex(
      (currentIndex) =>
        currentIndex ===
        galleryImages.length - 1
          ? 0
          : currentIndex + 1
    );
  };

  const handleSelectImage = (
    index
  ) => {
    setSelectedImageIndex(index);
  };

  // ======================================================
  // CARRITO
  // ======================================================

  const handleAddToCart = () => {
    if (!product || !hasStock) {
      return;
    }

    // ==================================================
    // PRODUCTO BASE:
    // selectedVariant = null
    //
    // VARIANTE:
    // selectedVariant = variante elegida
    //
    // El cart.store.js se encarga de guardar:
    // productId + variantId
    // ==================================================

    addToCart(
      product,
      selectedVariant
    );

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  // ======================================================
  // RESEÑAS
  // ======================================================

  const handleSubmitReview = async (
    event
  ) => {
    event.preventDefault();

    setReviewError("");
    setReviewSuccess("");

    if (!user) {
      setReviewError(
        "Debés iniciar sesión para calificar este producto."
      );

      return;
    }

    if (
      selectedRating < 1 ||
      selectedRating > 5
    ) {
      setReviewError(
        "Seleccioná una calificación de 1 a 5 estrellas."
      );

      return;
    }

    try {
      setSubmittingReview(true);

      await createProductReview(id, {
        rating: selectedRating,
        comment: comment.trim(),
      });

      setSelectedRating(0);
      setComment("");

      setReviewSuccess(
        "¡Gracias! Tu opinión fue publicada correctamente."
      );

      await loadReviews();
    } catch (error) {
      console.error(
        "ERROR CREANDO RESEÑA:",
        error
      );

      setReviewError(
        error.response?.data?.message ||
          "No se pudo publicar tu opinión."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (
    reviewId
  ) => {
    const confirmed =
      window.confirm(
        "¿Seguro que querés eliminar tu opinión? Esta acción no se puede deshacer."
      );

    if (!confirmed) {
      return;
    }

    try {
      setReviewError("");
      setReviewSuccess("");

      setDeletingReviewId(reviewId);

      await deleteProductReview(
        reviewId
      );

      setReviewSuccess(
        "Tu opinión fue eliminada correctamente."
      );

      await loadReviews();
    } catch (error) {
      console.error(
        "ERROR ELIMINANDO RESEÑA:",
        error
      );

      setReviewError(
        error.response?.data?.message ||
          "No se pudo eliminar tu opinión."
      );
    } finally {
      setDeletingReviewId(null);
    }
  };

  // ======================================================
  // ESTRELLAS
  // ======================================================

  const renderStars = (
    rating,
    size = 18
  ) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <Star
              key={star}
              size={size}
              className={
                star <=
                Math.round(rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-zinc-700"
              }
            />
          )
        )}
      </div>
    );
  };

  const renderInteractiveStars =
    () => {
      return (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(
            (star) => (
              <button
                key={star}
                type="button"
                onClick={() =>
                  setSelectedRating(
                    star
                  )
                }
                className="transition hover:scale-110"
                aria-label={`Calificar con ${star} estrellas`}
              >
                <Star
                  size={30}
                  className={
                    star <=
                    selectedRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-zinc-600 hover:text-yellow-400"
                  }
                />
              </button>
            )
          )}
        </div>
      );
    };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <section className="min-h-[60vh] w-full overflow-x-hidden bg-zinc-950 px-4 py-20">
        <div className="w-full text-center">
          <p className="text-zinc-500">
            Cargando producto...
          </p>
        </div>
      </section>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error || !product) {
    return (
      <section className="min-h-[60vh] w-full overflow-x-hidden bg-zinc-950 px-4 py-20">
        <div className="w-full">

          <Link
            to="/products"
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-red-500"
          >
            <ArrowLeft size={18} />
            Volver a productos
          </Link>

          <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">

            <p className="text-red-500">
              {error ||
                "Producto no encontrado."}
            </p>

          </div>

        </div>
      </section>
    );
  }

  const userAlreadyReviewed =
    user
      ? reviews.some(
          (review) =>
            review.userId ===
              user.id ||
            review.user?.id ===
              user.id
        )
      : false;

  return (
    <section className="min-h-screen w-full min-w-0 overflow-x-hidden bg-zinc-950 px-3 py-6 sm:px-4 sm:py-10">

      <div className="w-full min-w-0">

        {/* VOLVER */}

        <button
          onClick={() =>
            navigate(-1)
          }
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-red-500 sm:mb-8"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        {/* PRODUCTO */}

        <div className="grid w-full min-w-0 gap-8 lg:grid-cols-2 lg:gap-10">

          {/* GALERÍA */}

          <div className="w-full min-w-0">

            <div className="flex w-full min-w-0 gap-3 sm:gap-4">

              {/* MINIATURAS */}

              {galleryImages.length >
                1 && (
                <div className="hidden w-20 shrink-0 flex-col gap-3 lg:flex">

                  {galleryImages.map(
                    (
                      image,
                      index
                    ) => (
                      <button
                        key={`${image.url}-${index}`}
                        type="button"
                        onClick={() =>
                          handleSelectImage(
                            index
                          )
                        }
                        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-zinc-900 transition ${
                          selectedImageIndex ===
                          index
                            ? "border-red-600"
                            : "border-zinc-800 hover:border-zinc-600"
                        }`}
                      >

                        <img
                          src={
                            image.url
                          }
                          alt={`${product.name} - imagen ${
                            index + 1
                          }`}
                          className="block h-full w-full object-cover"
                        />

                        {selectedImageIndex ===
                          index && (
                          <div className="absolute inset-0 bg-red-600/10" />
                        )}

                      </button>
                    )
                  )}

                </div>
              )}

              {/* IMAGEN GRANDE */}

              <div className="relative flex h-[300px] w-full min-w-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 sm:h-[400px] lg:h-[500px]">

                {selectedImage ? (
                  <img
                    src={
                      selectedImage
                    }
                    alt={
                      selectedVariant
                        ? `${product.name} - ${selectedVariant.name}`
                        : product.name
                    }
                    className="block h-full w-full min-w-0 object-contain p-3 sm:p-6 lg:p-8"
                  />
                ) : (
                  <div className="text-center">

                    <ShoppingCart
                      size={60}
                      className="mx-auto text-zinc-700"
                    />

                    <p className="mt-3 text-zinc-600">
                      Sin imagen
                    </p>

                  </div>
                )}

                {/* FLECHA IZQUIERDA */}

                {galleryImages.length >
                  1 && (
                  <button
                    type="button"
                    onClick={
                      handlePreviousImage
                    }
                    aria-label="Imagen anterior"
                    className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-black/70 text-white backdrop-blur-sm transition hover:border-red-600 hover:bg-red-600 sm:left-4 sm:h-11 sm:w-11"
                  >
                    <ChevronLeft
                      size={24}
                    />
                  </button>
                )}

                {/* FLECHA DERECHA */}

                {galleryImages.length >
                  1 && (
                  <button
                    type="button"
                    onClick={
                      handleNextImage
                    }
                    aria-label="Siguiente imagen"
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-black/70 text-white backdrop-blur-sm transition hover:border-red-600 hover:bg-red-600 sm:right-4 sm:h-11 sm:w-11"
                  >
                    <ChevronRight
                      size={24}
                    />
                  </button>
                )}

                {/* CONTADOR */}

                {galleryImages.length >
                  1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm sm:bottom-4 sm:px-4 sm:py-2">
                    {selectedImageIndex +
                      1}{" "}
                    /{" "}
                    {
                      galleryImages.length
                    }
                  </div>
                )}

              </div>

            </div>

            {/* MINIATURAS MOBILE */}

            {galleryImages.length >
              1 && (
              <div className="mt-4 flex w-full min-w-0 gap-3 overflow-x-auto pb-2 lg:hidden">

                {galleryImages.map(
                  (
                    image,
                    index
                  ) => (
                    <button
                      key={`mobile-${image.url}-${index}`}
                      type="button"
                      onClick={() =>
                        handleSelectImage(
                          index
                        )
                      }
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                        selectedImageIndex ===
                        index
                          ? "border-red-600"
                          : "border-zinc-800"
                      }`}
                    >

                      <img
                        src={
                          image.url
                        }
                        alt={`${product.name} - imagen ${
                          index + 1
                        }`}
                        className="block h-full w-full object-cover"
                      />

                    </button>
                  )
                )}

              </div>
            )}

          </div>

          {/* INFORMACIÓN */}

          <div className="w-full min-w-0">

            {/* MARCA / CATEGORÍA */}

            <div className="mb-4 flex min-w-0 flex-wrap gap-2">

              {product.brand?.name && (
                <span className="max-w-full rounded-full bg-red-950/40 px-3 py-1 text-xs font-semibold text-red-400">
                  {
                    product.brand
                      .name
                  }
                </span>
              )}

              {product.category?.name && (
                <span className="flex max-w-full items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">

                  <Tag size={12} />

                  <span className="break-words">
                    {
                      product
                        .category
                        .name
                    }
                  </span>

                </span>
              )}

            </div>

            {/* NOMBRE */}

            <h1 className="break-words text-3xl font-black text-white sm:text-4xl md:text-5xl">
              {product.name}
            </h1>

            {/* CLASIFICACIÓN */}

            <div className="mt-5 flex min-w-0 flex-wrap items-center gap-3">

              {renderStars(
                averageRating,
                20
              )}

              <span className="font-bold text-white">
                {averageRating >
                0
                  ? averageRating.toFixed(
                      1
                    )
                  : "Sin calificaciones"}
              </span>

              {totalReviews >
                0 && (
                <span className="text-sm text-zinc-500">
                  (
                  {
                    totalReviews
                  }{" "}
                  {totalReviews ===
                  1
                    ? "reseña"
                    : "reseñas"}
                  )
                </span>
              )}

            </div>

            {/* DESCRIPCIÓN */}

            <div className="mt-8 min-w-0">

              <h2 className="mb-3 text-lg font-bold text-white">
                Descripción
              </h2>

              <p className="whitespace-pre-line break-words leading-7 text-zinc-400">
                {product.description ||
                  "Este producto no tiene una descripción disponible."}
              </p>

            </div>

            {/* ==================================================
                SELECTOR DE VARIANTES
                ================================================== */}

            {product.hasVariants &&
              Array.isArray(
                product.variants
              ) &&
              product.variants.length >
                0 && (
                <div className="mt-8">

                  <div className="mb-4">

                    <h2 className="text-lg font-bold text-white">
                      Elegí un color
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Seleccioná el color que querés comprar.
                    </p>

                  </div>

                  <div className="flex flex-wrap gap-3">

                    {/* PRODUCTO BASE / SIN COLOR */}

                    <button
                      type="button"
                      onClick={
                        handleSelectBaseProduct
                      }
                      className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                        selectedVariant ===
                        null
                          ? "border-red-600 bg-red-950/30"
                          : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >

                      <span
                        className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-500 bg-zinc-800"
                        title="Producto base"
                      >
                        <span className="absolute h-[2px] w-8 rotate-45 bg-zinc-300" />
                      </span>

                      <span
                        className={`text-sm font-semibold ${
                          selectedVariant ===
                          null
                            ? "text-white"
                            : "text-zinc-400 group-hover:text-white"
                        }`}
                      >
                        Sin color
                      </span>

                      {selectedVariant ===
                        null && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white">
                          ✓
                        </span>
                      )}

                    </button>

                    {/* VARIANTES */}

                    {product.variants.map(
                      (variant) => {

                        const isSelected =
                          selectedVariant?.id ===
                          variant.id;

                        const variantHasStock =
                          Number(
                            variant.stock ||
                              0
                          ) > 0;

                        return (
                          <button
                            key={
                              variant.id
                            }
                            type="button"
                            onClick={() =>
                              handleSelectVariant(
                                variant
                              )
                            }
                            className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                              isSelected
                                ? "border-red-600 bg-red-950/30"
                                : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                            }`}
                          >

                            <span
                              className="h-7 w-7 shrink-0 rounded-full border-2 border-white/20 shadow-inner"
                              style={{
                                backgroundColor:
                                  variant.colorHex ||
                                  "#71717a",
                              }}
                            />

                            <span
                              className={`text-sm font-semibold ${
                                isSelected
                                  ? "text-white"
                                  : "text-zinc-400 group-hover:text-white"
                              }`}
                            >
                              {
                                variant.name
                              }
                            </span>

                            {!variantHasStock && (
                              <span className="text-xs font-semibold text-red-500">
                                Sin stock
                              </span>
                            )}

                            {isSelected && (
                              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white">
                                ✓
                              </span>
                            )}

                          </button>
                        );
                      }
                    )}

                  </div>

                  {/* STOCK */}

                  <div className="mt-4">

                    {selectedVariant ? (
                      <p className="text-sm text-zinc-500">
                        Stock de{" "}
                        <span className="font-semibold text-zinc-300">
                          {
                            selectedVariant.name
                          }
                        </span>
                        :{" "}
                        <span
                          className={
                            currentStock >
                            0
                              ? "font-semibold text-green-500"
                              : "font-semibold text-red-500"
                          }
                        >
                          {
                            currentStock
                          }
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-500">
                        Stock del producto base:{" "}
                        <span
                          className={
                            currentStock >
                            0
                              ? "font-semibold text-green-500"
                              : "font-semibold text-red-500"
                          }
                        >
                          {
                            currentStock
                          }
                        </span>
                      </p>
                    )}

                  </div>

                </div>
              )}

            {/* PRECIO */}

            <div className="mt-8">

              {product.offerActive &&
              product.offerPrice !=
                null &&
              Number(
                product.offerPrice
              ) <
                Number(
                  product.price
                ) ? (
                <div>

                  {product.offerPercentage !=
                    null && (
                    <span className="mb-3 inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
                      -
                      {
                        product.offerPercentage
                      }
                      %
                    </span>
                  )}

                  <p className="text-lg font-semibold text-zinc-500 line-through">
                    UYU{" "}
                    {Number(
                      product.price
                    ).toLocaleString(
                      "es-UY"
                    )}
                  </p>

                  <p className="text-3xl font-black text-green-500 sm:text-4xl">
                    UYU{" "}
                    {Number(
                      product.offerPrice
                    ).toLocaleString(
                      "es-UY"
                    )}
                  </p>

                  <span className="mt-2 inline-block rounded-md bg-red-950/50 px-2 py-1 text-xs font-bold text-red-400">
                    OFERTA
                  </span>

                </div>
              ) : (
                <p className="text-3xl font-black text-red-500 sm:text-4xl">
                  UYU{" "}
                  {Number(
                    product.price
                  ).toLocaleString(
                    "es-UY"
                  )}
                </p>
              )}

            </div>

            {/* CARRITO */}

            <button
              disabled={!hasStock}
              onClick={
                handleAddToCart
              }
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
            >

              <ShoppingCart
                size={20}
              />

              {added
                ? "✓ Agregado al carrito"
                : hasStock
                ? "Agregar al carrito"
                : "Sin stock"}

            </button>

          </div>

        </div>

        {/* ==================================================
            RESEÑAS
            ================================================== */}

        <div className="mt-12 w-full min-w-0 border-t border-zinc-800 pt-10 sm:mt-16 sm:pt-12">

          <div className="mb-8 w-full min-w-0">

            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-red-500">
              EXPERIENCIAS
            </p>

            <h2 className="break-words text-2xl font-black text-white sm:text-3xl">
              Opiniones de clientes
            </h2>

            <p className="mt-2 break-words text-zinc-500">
              Conocé la experiencia de otros clientes con este producto.
            </p>

          </div>

          {/* RESUMEN */}

          <div className="mb-10 w-full min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">

            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">

              <div>

                <p className="text-5xl font-black text-white">
                  {averageRating >
                  0
                    ? averageRating.toFixed(
                        1
                      )
                    : "—"}
                </p>

                <div className="mt-2">
                  {renderStars(
                    averageRating,
                    22
                  )}
                </div>

              </div>

              <div className="sm:border-l sm:border-zinc-800 sm:pl-6">

                <p className="font-semibold text-white">
                  {
                    totalReviews
                  }{" "}
                  {totalReviews ===
                  1
                    ? "opinión"
                    : "opiniones"}
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Promedio de calificaciones
                </p>

              </div>

            </div>

          </div>

          {/* MENSAJES */}

          {reviewError && (
            <div className="mb-6 w-full break-words rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400">
              {
                reviewError
              }
            </div>
          )}

          {reviewSuccess && (
            <div className="mb-6 w-full break-words rounded-xl border border-green-900/50 bg-green-950/30 p-4 text-sm text-green-400">
              {
                reviewSuccess
              }
            </div>
          )}

          {/* FORMULARIO */}

          {!user ? (
            <div className="mb-10 w-full min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">

              <h3 className="text-xl font-bold text-white">
                ¿Compraste este producto?
              </h3>

              <p className="mt-2 break-words text-zinc-500">
                Iniciá sesión para compartir tu experiencia y calificarlo.
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/login"
                  )
                }
                className="mt-5 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Iniciar sesión
              </button>

            </div>
          ) : userAlreadyReviewed ? (
            <div className="mb-10 w-full min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">

              <div className="flex min-w-0 items-center gap-3">

                <Star
                  size={22}
                  className="shrink-0 fill-yellow-400 text-yellow-400"
                />

                <h3 className="break-words text-xl font-bold text-white">
                  Ya calificaste este producto
                </h3>

              </div>

              <p className="mt-2 text-zinc-500">
                Gracias por compartir tu experiencia.
              </p>

            </div>
          ) : (
            <form
              onSubmit={
                handleSubmitReview
              }
              className="mb-10 w-full min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6"
            >

              <h3 className="text-xl font-bold text-white">
                Compartí tu experiencia
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Tu opinión ayuda a otros clientes a elegir mejor.
              </p>

              <div className="mt-6">

                <p className="mb-3 text-sm font-semibold text-white">
                  Tu calificación
                </p>

                {renderInteractiveStars()}

              </div>

              <div className="mt-6">

                <label
                  htmlFor="review-comment"
                  className="mb-2 block text-sm font-semibold text-white"
                >
                  Comentario
                </label>

                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(
                    event
                  ) =>
                    setComment(
                      event.target
                        .value
                    )
                  }
                  maxLength={1000}
                  rows={5}
                  placeholder="Contanos tu experiencia con este producto..."
                  className="w-full min-w-0 resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600"
                />

                <p className="mt-2 text-right text-xs text-zinc-600">
                  {
                    comment.length
                  }
                  /1000
                </p>

              </div>

              <button
                type="submit"
                disabled={
                  submittingReview
                }
                className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
              >
                {submittingReview
                  ? "Publicando..."
                  : "Publicar opinión"}
              </button>

            </form>
          )}

          {/* LISTA DE RESEÑAS */}

          {reviewsLoading ? (
            <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">

              <p className="text-zinc-500">
                Cargando opiniones...
              </p>

            </div>
          ) : reviews.length ===
            0 ? (
            <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">

              <Star
                size={40}
                className="mx-auto text-zinc-700"
              />

              <p className="mt-4 font-semibold text-white">
                Este producto todavía no tiene opiniones.
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Sé el primero en compartir tu experiencia.
              </p>

            </div>
          ) : (
            <div className="w-full min-w-0 space-y-4">

              {reviews.map(
                (review) => {
                  const isOwnReview =
                    user &&
                    (
                      review.userId ===
                        user.id ||
                      review.user?.id ===
                        user.id
                    );

                  return (
                    <article
                      key={
                        review.id
                      }
                      className="w-full min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6"
                    >

                      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800">

                            {review.user
                              ?.avatar ? (
                              <img
                                src={
                                  review
                                    .user
                                    .avatar
                                }
                                alt={
                                  review
                                    .user
                                    .firstName ||
                                  "Usuario"
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="font-bold text-zinc-500">
                                {review
                                  .user
                                  ?.firstName
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase() ||
                                  "U"}
                              </span>
                            )}

                          </div>

                          <div className="min-w-0">

                            <p className="break-words font-semibold text-white">
                              {
                                review
                                  .user
                                  ?.firstName
                              }{" "}
                              {
                                review
                                  .user
                                  ?.lastName ||
                                ""
                              }
                            </p>

                            <p className="text-xs text-zinc-500">
                              {new Date(
                                review.createdAt
                              ).toLocaleDateString(
                                "es-UY"
                              )}
                            </p>

                          </div>

                        </div>

                        <div className="flex min-w-0 flex-wrap items-center gap-4">

                          {renderStars(
                            review.rating,
                            17
                          )}

                          {isOwnReview && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteReview(
                                  review.id
                                )
                              }
                              disabled={
                                deletingReviewId ===
                                review.id
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-red-900/50 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                              <Trash2
                                size={
                                  15
                                }
                              />

                              {deletingReviewId ===
                              review.id
                                ? "Eliminando..."
                                : "Eliminar"}

                            </button>
                          )}

                        </div>

                      </div>

                      {review.comment && (
                        <p className="mt-5 break-words leading-7 text-zinc-400">
                          {
                            review.comment
                          }
                        </p>
                      )}

                    </article>
                  );
                }
              )}

            </div>
          )}

        </div>

      </div>

    </section>
  );
}

