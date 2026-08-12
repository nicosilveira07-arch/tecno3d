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

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const result = await getProductById(id);

        const loadedProduct = result.data;

        setProduct(loadedProduct);

        /*
         * La imagen principal del producto se mantiene
         * como primera imagen visual de la galería.
         */
        setSelectedImageIndex(0);
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
  
  /*
   * GALERÍA
   *
   * product.image = imagen principal
   * product.images = imágenes adicionales
   *
   * Construimos una única lista para la galería.
   */
  const galleryImages = (() => {
    if (!product) {
      return [];
    }

    const images = [];

    if (product.image) {
      images.push({
        url: product.image,
        publicId: null,
      });
    }

    if (Array.isArray(product.images)) {
      product.images.forEach((image) => {
        if (!image?.url) {
          return;
        }

        /*
         * Evitamos duplicar la imagen principal
         * si también está guardada en ProductImage.
         */
        if (
          image.url === product.image
        ) {
          return;
        }

        images.push({
          url: image.url,
          publicId: image.publicId || null,
        });
      });
    }

    return images;
  })();

  const selectedImage =
    galleryImages[selectedImageIndex]?.url ||
    product?.image ||
    "";

  const handlePreviousImage = () => {
    if (galleryImages.length <= 1) {
      return;
    }

    setSelectedImageIndex((currentIndex) =>
      currentIndex === 0
        ? galleryImages.length - 1
        : currentIndex - 1
    );
  };

  const handleNextImage = () => {
    if (galleryImages.length <= 1) {
      return;
    }

    setSelectedImageIndex((currentIndex) =>
      currentIndex === galleryImages.length - 1
        ? 0
        : currentIndex + 1
    );
  };

  const handleSelectImage = (index) => {
    setSelectedImageIndex(index);
  };

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) {
      return;
    }

    addToCart(product);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  const handleSubmitReview = async (event) => {
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

  const handleDeleteReview = async (reviewId) => {
    const confirmed = window.confirm(
      "¿Seguro que querés eliminar tu opinión? Esta acción no se puede deshacer."
    );
    

    if (!confirmed) {
      return;
    }

    try {
      setReviewError("");
      setReviewSuccess("");

      setDeletingReviewId(reviewId);

      await deleteProductReview(reviewId);

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
  

  const renderStars = (rating, size = 18) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-zinc-700"
            }
          />
        ))}
      </div>
    );
  };

  const renderInteractiveStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() =>
              setSelectedRating(star)
            }
            className="transition hover:scale-110"
            aria-label={`Calificar con ${star} estrellas`}
          >
            <Star
              size={30}
              className={
                star <= selectedRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-zinc-600 hover:text-yellow-400"
              }
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="min-h-[60vh] bg-zinc-950 px-4 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-zinc-500">
            Cargando producto...
          </p>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="min-h-[60vh] bg-zinc-950 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/products"
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-red-500"
          >
            <ArrowLeft size={18} />
            Volver a productos
          </Link>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-red-500">
              {error ||
                "Producto no encontrado."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const hasStock = product.stock > 0;

  const userAlreadyReviewed = user
    ? reviews.some(
        (review) =>
          review.userId === user.id ||
          review.user?.id === user.id
      )
    : false;

  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="mx-auto max-w-7xl">

        {/* VOLVER */}

        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-red-500"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        {/* PRODUCTO */}

        <div className="grid gap-10 lg:grid-cols-2">

          {/* GALERÍA */}

          <div>

            <div className="flex gap-4">

              {/* MINIATURAS */}

              {galleryImages.length > 1 && (
                <div className="flex w-20 flex-col gap-3">

                  {galleryImages.map(
                    (image, index) => (
                      <button
                        key={`${image.url}-${index}`}
                        type="button"
                        onClick={() =>
                          handleSelectImage(
                            index
                          )
                        }
                        className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 bg-zinc-900 transition ${
                          selectedImageIndex ===
                          index
                            ? "border-red-600"
                            : "border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`${product.name} - imagen ${
                            index + 1
                          }`}
                          className="h-full w-full object-cover"
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

              <div className="relative flex min-h-[500px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">

                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="h-full max-h-[600px] w-full object-contain p-8"
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

                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    onClick={
                      handlePreviousImage
                    }
                    aria-label="Imagen anterior"
                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-black/70 text-white backdrop-blur-sm transition hover:border-red-600 hover:bg-red-600"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}

                {/* FLECHA DERECHA */}

                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    onClick={
                      handleNextImage
                    }
                    aria-label="Siguiente imagen"
                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-black/70 text-white backdrop-blur-sm transition hover:border-red-600 hover:bg-red-600"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}

                {/* CONTADOR */}

                {galleryImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                    {selectedImageIndex + 1} /{" "}
                    {galleryImages.length}
                  </div>
                )}

              </div>

            </div>

            {/* MINIATURAS INFERIORES EN MOBILE */}

            {galleryImages.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 lg:hidden">

                {galleryImages.map(
                  (image, index) => (
                    <button
                      key={`mobile-${image.url}-${index}`}
                      type="button"
                      onClick={() =>
                        handleSelectImage(
                          index
                        )
                      }
                      className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 ${
                        selectedImageIndex ===
                        index
                          ? "border-red-600"
                          : "border-zinc-800"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} - imagen ${
                          index + 1
                        }`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                )}

              </div>
            )}

          </div>

          {/* INFORMACIÓN */}

          <div className="flex flex-col justify-center">

            {/* MARCA / CATEGORÍA */}

            <div className="mb-4 flex flex-wrap gap-2">

              {product.brand?.name && (
                <span className="rounded-full bg-red-950/40 px-3 py-1 text-xs font-semibold text-red-400">
                  {product.brand.name}
                </span>
              )}

              {product.category?.name && (
                <span className="flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
                  <Tag size={12} />
                  {product.category.name}
                </span>
              )}

            </div>

            {/* NOMBRE */}

            <h1 className="text-4xl font-black text-white md:text-5xl">
              {product.name}
            </h1>

            {/* CLASIFICACIÓN */}

            <div className="mt-5 flex items-center gap-3">
              {renderStars(
                averageRating,
                20
              )}

              <span className="font-bold text-white">
                {averageRating > 0
                  ? averageRating.toFixed(1)
                  : "Sin calificaciones"}
              </span>

              {totalReviews > 0 && (
                <span className="text-sm text-zinc-500">
                  ({totalReviews}{" "}
                  {totalReviews === 1
                    ? "reseña"
                    : "reseñas"})
                </span>
              )}
            </div>

            {/* DESCRIPCIÓN */}

            <div className="mt-8">
              <h2 className="mb-3 text-lg font-bold text-white">
                Descripción
              </h2>

              <p className="leading-7 text-zinc-400">
                {product.description ||
                  "Este producto no tiene una descripción disponible."}
              </p>
            </div>

            {/* PRECIO */}

            <div className="mt-8">
              {product.offerActive &&
              product.offerPrice != null &&
              Number(product.offerPrice) < Number(product.price) ? (
                <div>
                  {/* DESCUENTO */}
                  {product.offerPercentage != null && (
                    <span className="mb-3 inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
                      -{product.offerPercentage}%
                    </span>
                  )}

                  {/* PRECIO ORIGINAL */}
                  <p className="text-lg font-semibold text-zinc-500 line-through">
                    UYU{" "}
                    {Number(product.price).toLocaleString(
                      "es-UY"
                    )}
                  </p>
                  
                  {/* PRECIO OFERTA */}
                  <p className="text-4xl font-black text-green-500">
                    UYU{" "}
                    {Number(product.offerPrice).toLocaleString(
                      "es-UY"
                    )}
                  </p>
                  
                  <span className="mt-2 inline-block rounded-md bg-red-950/50 px-2 py-1 text-xs font-bold text-red-400">
                    OFERTA
                  </span>
                </div>
              ) : (
                <p className="text-4xl font-black text-red-500">
                  UYU{" "}
                  {Number(product.price).toLocaleString(
                    "es-UY"
                  )}
                </p>
              )}
            </div>

            {/* CARRITO */}

            <button
              disabled={!hasStock}
              onClick={handleAddToCart}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
            >
              <ShoppingCart size={20} />

              {added
                ? "✓ Agregado al carrito"
                : hasStock
                ? "Agregar al carrito"
                : "Sin stock"}
            </button>

          </div>

        </div>

        {/* RESEÑAS */}

        <div className="mt-16 border-t border-zinc-800 pt-12">

          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-red-500">
              EXPERIENCIAS
            </p>

            <h2 className="text-3xl font-black text-white">
              Opiniones de clientes
            </h2>

            <p className="mt-2 text-zinc-500">
              Conocé la experiencia de otros clientes con este producto.
            </p>
          </div>

          {/* RESUMEN */}

          <div className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              <div>
                <p className="text-5xl font-black text-white">
                  {averageRating > 0
                    ? averageRating.toFixed(1)
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
                  {totalReviews}{" "}
                  {totalReviews === 1
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
            <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400">
              {reviewError}
            </div>
          )}

          {reviewSuccess && (
            <div className="mb-6 rounded-xl border border-green-900/50 bg-green-950/30 p-4 text-sm text-green-400">
              {reviewSuccess}
            </div>
          )}

          {/* FORMULARIO */}

          {!user ? (
            <div className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

              <h3 className="text-xl font-bold text-white">
                ¿Compraste este producto?
              </h3>

              <p className="mt-2 text-zinc-500">
                Iniciá sesión para compartir tu experiencia y calificarlo.
              </p>

              <button
                onClick={() =>
                  navigate("/login")
                }
                className="mt-5 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Iniciar sesión
              </button>

            </div>
          ) : userAlreadyReviewed ? (
            <div className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

              <div className="flex items-center gap-3">

                <Star
                  size={22}
                  className="fill-yellow-400 text-yellow-400"
                />

                <h3 className="text-xl font-bold text-white">
                  Ya calificaste este producto
                </h3>

              </div>

              <p className="mt-2 text-zinc-500">
                Gracias por compartir tu experiencia.
              </p>

            </div>
          ) : (
            <form
              onSubmit={handleSubmitReview}
              className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
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
                  onChange={(event) =>
                    setComment(
                      event.target.value
                    )
                  }
                  maxLength={1000}
                  rows={5}
                  placeholder="Contanos tu experiencia con este producto..."
                  className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600"
                />

                <p className="mt-2 text-right text-xs text-zinc-600">
                  {comment.length}/1000
                </p>

              </div>

              <button
                type="submit"
                disabled={submittingReview}
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
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-zinc-500">
                Cargando opiniones...
              </p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">

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
            <div className="space-y-4">

              {reviews.map((review) => {

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
                    key={review.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                  >

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-zinc-800">

                          {review.user?.avatar ? (
                            <img
                              src={
                                review.user
                                  .avatar
                              }
                              alt={
                                review.user
                                  .firstName ||
                                "Usuario"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-zinc-500">
                              {review.user?.firstName
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "U"}
                            </span>
                          )}

                        </div>

                        <div>

                          <p className="font-semibold text-white">
                            {review.user
                              ?.firstName ||
                              "Usuario"}{" "}
                            {review.user
                              ?.lastName ||
                              ""}
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

                      <div className="flex items-center gap-4">

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
                              size={15}
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
                      <p className="mt-5 leading-7 text-zinc-400">
                        {review.comment}
                      </p>
                    )}

                  </article>
                );
              })}

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
