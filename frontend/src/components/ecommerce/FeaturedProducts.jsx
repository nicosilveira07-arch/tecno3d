import { useEffect, useState } from "react";

import {
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { getProducts } from "@/services/products.api";
import { addToCart } from "@/features/cart/cart.store";

import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "@/services/favorites.api";

export default function FeaturedProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [favorites, setFavorites] = useState(
    new Set()
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [addedProduct, setAddedProduct] =
    useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await getProducts();

        const productsData = response.data || [];

        setProducts(
          productsData.slice(0, 4)
        );
      } catch (error) {
        console.error(
          "ERROR CARGANDO PRODUCTOS:",
          error
        );

        setError(
          "No se pudieron cargar los productos."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await getFavorites();

        const favoritesData = response.data || [];

        const favoriteIds = new Set(
          favoritesData.map(
            (favorite) => favorite.productId
          )
        );

        setFavorites(favoriteIds);
      } catch (error) {
        console.error(
          "ERROR CARGANDO FAVORITOS:",
          error
        );
      }
    };

    loadFavorites();
  }, []);

  const handleFavorite = async (
    event,
    productId
  ) => {
    event.stopPropagation();
  
    const token = localStorage.getItem("token");
  
    if (!token) {
      navigate("/login");
      return;
    }
  
    const isFavorite =
      favorites.has(productId);
  
    try {
      if (isFavorite) {
        await removeFavorite(productId);
      
        setFavorites((previous) => {
          const updated = new Set(previous);
        
          updated.delete(productId);
        
          return updated;
        });
      } else {
        await addFavorite(productId);
      
        setFavorites((previous) => {
          const updated = new Set(previous);
        
          updated.add(productId);
        
          return updated;
        });
      
        // AVISAR AL NAVBAR QUE SE AGREGÓ UN FAVORITO
        window.dispatchEvent(
          new CustomEvent("favorite-added")
        );
      }
    } catch (error) {
      console.error(
        "ERROR ACTUALIZANDO FAVORITO:",
        error
      );
    }
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (
    event,
    product
  ) => {
    event.stopPropagation();

    addToCart(product);

    setAddedProduct(product.id);

    setTimeout(() => {
      setAddedProduct(null);
    }, 1500);
  };

  return (
    <section>
      <div>

        {/* ENCABEZADO */}

        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">
            Productos Destacados
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
            className="text-red-500 transition hover:text-red-400"
          >
            Ver todos →
          </button>
        </div>

        {/* CARGANDO */}

        {loading && (
          <p className="text-zinc-500">
            Cargando productos...
          </p>
        )}

        {/* ERROR */}

        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}

        {/* SIN PRODUCTOS */}

        {!loading &&
          !error &&
          products.length === 0 && (
            <p className="text-zinc-500">
              Todavía no hay productos.
            </p>
          )}

        {/* PRODUCTOS */}

        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

              {products.map((product) => {
                const stockText =
                  product.stock > 5
                    ? "Disponible"
                    : product.stock > 0
                    ? "Últimas unidades"
                    : "Sin stock";

                const isFavorite =
                  favorites.has(product.id);

                const reviews =
                  product.reviews || [];

                const reviewCount =
                  reviews.length;

                const averageRating =
                  reviewCount > 0
                    ? reviews.reduce(
                        (total, review) =>
                          total +
                          Number(
                            review.rating
                          ),
                        0
                      ) / reviewCount
                    : 0;

                const roundedRating =
                  Math.round(
                    averageRating
                  );

                /*
                 * OFERTA
                 *
                 * Solo consideramos que el producto
                 * está en oferta cuando offerActive
                 * está activo y existe offerPrice.
                 */
                const hasOffer =
                  product.offerActive === true &&
                  product.offerPrice !== null &&
                  product.offerPrice !== undefined &&
                  Number(product.offerPrice) > 0;

                const offerPrice = hasOffer
                  ? Number(product.offerPrice)
                  : null;

                const offerPercentage =
                  product.offerPercentage !== null &&
                  product.offerPercentage !== undefined
                    ? Number(
                        product.offerPercentage
                      )
                    : null;

                return (
                  <div
                    key={product.id}
                    onClick={() =>
                      handleProductClick(
                        product
                      )
                    }
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition duration-300 hover:-translate-y-2 hover:border-red-600"
                  >

                    {/* IMAGEN */}

                    <div className="relative">

                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-70 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-72 w-full items-center justify-center bg-zinc-950 text-zinc-600">
                          Sin imagen
                        </div>
                      )}

                      {/* OFERTA */}

                      {hasOffer && (
                        <div className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow-lg">
                          {offerPercentage
                            ? `-${offerPercentage}%`
                            : "OFERTA"}
                        </div>
                      )}

                      {/* FAVORITO */}

                      <button
                        type="button"
                        onClick={(event) =>
                          handleFavorite(
                            event,
                            product.id
                          )
                        }
                        className={`absolute right-4 top-4 rounded-full bg-black/60 p-2 transition ${
                          isFavorite
                            ? "text-red-500"
                            : "text-white hover:bg-red-600"
                        }`}
                        aria-label={
                          isFavorite
                            ? "Quitar de favoritos"
                            : "Agregar a favoritos"
                        }
                      >
                        <Heart
                          size={18}
                          fill={
                            isFavorite
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>

                    </div>

                    {/* INFORMACIÓN */}

                    <div className="p-6">

                      {/* MARCA */}

                      {product.brand?.name && (
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-500">
                          {product.brand.name}
                        </p>
                      )}

                      <h3 className="mb-2 text-lg font-semibold text-white">
                        {product.name}
                      </h3>

                      {/* ESTRELLAS DINÁMICAS */}

                      {reviewCount > 0 ? (
                        <div className="mb-3 flex items-center gap-2">

                          <div className="flex">
                            {Array.from({
                              length: 5,
                            }).map(
                              (_, index) => (
                                <Star
                                  key={index}
                                  size={16}
                                  fill={
                                    index <
                                    roundedRating
                                      ? "currentColor"
                                      : "none"
                                  }
                                  className={
                                    index <
                                    roundedRating
                                      ? "text-yellow-400"
                                      : "text-zinc-700"
                                  }
                                />
                              )
                            )}
                          </div>

                          <span className="text-xs text-zinc-500">
                            {averageRating.toFixed(
                              1
                            )}{" "}
                            ({reviewCount})
                          </span>

                        </div>
                      ) : (
                        <div className="mb-3 flex items-center gap-2">

                          <div className="flex">
                            {Array.from({
                              length: 5,
                            }).map(
                              (_, index) => (
                                <Star
                                  key={index}
                                  size={16}
                                  className="text-zinc-700"
                                />
                              )
                            )}
                          </div>

                          <span className="text-xs text-zinc-600">
                            Sin reseñas
                          </span>

                        </div>
                      )}

                      {/* PRECIO */}

                      {hasOffer ? (
                        <div>

                          <div className="text-sm font-semibold text-zinc-500 line-through">
                            UYU{" "}
                            {Number(
                              product.price
                            ).toLocaleString(
                              "es-UY"
                            )}
                          </div>

                          <div className="mt-1 text-3xl font-black text-green-500">
                            UYU{" "}
                            {offerPrice.toLocaleString(
                              "es-UY"
                            )}
                          </div>

                          <span className="mt-2 inline-block rounded-md bg-red-950/50 px-2 py-1 text-xs font-bold text-red-400">
                            OFERTA
                          </span>

                        </div>
                      ) : (
                        <div className="text-3xl font-black text-red-500">
                          UYU{" "}
                          {Number(
                            product.price
                          ).toLocaleString(
                            "es-UY"
                          )}
                        </div>
                      )}

                      {/* STOCK */}

                      <p
                        className={`mt-2 text-sm ${
                          product.stock > 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {stockText}
                      </p>

                      {/* CARRITO */}

                      <button
                        type="button"
                        disabled={
                          product.stock <= 0
                        }
                        onClick={(event) =>
                          handleAddToCart(
                            event,
                            product
                          )
                        }
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
                      >
                        <ShoppingCart
                          size={18}
                        />

                        {addedProduct ===
                        product.id
                          ? "✓ Agregado al carrito"
                          : product.stock > 0
                          ? "Agregar al carrito"
                          : "Sin stock"}
                      </button>

                    </div>
                  </div>
                );
              })}

            </div>
          )}

      </div>
    </section>
  );
}

