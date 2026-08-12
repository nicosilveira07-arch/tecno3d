import { useEffect, useState } from "react";
import { ShoppingCart, Tag, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getProducts } from "@/services/products.api";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "@/services/favorites.api";

export default function Offers() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadOffers() {
      try {
        setLoading(true);
        setError("");

        const result = await getProducts({
          offerActive: "true",
        });

        setProducts(result.data || []);
      } catch (error) {
        console.error("ERROR CARGANDO OFERTAS:", error);

        setError(
          error.response?.data?.message ||
            "No se pudieron cargar las ofertas."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOffers();
  }, []);

  useEffect(() => {
    async function loadFavorites() {
      if (!token) {
        setFavorites([]);
        return;
      }

      try {
        const result = await getFavorites();

        const favoriteIds = (result.data || []).map(
          (favorite) => favorite.productId
        );

        setFavorites(favoriteIds);
      } catch (error) {
        console.error("ERROR CARGANDO FAVORITOS:", error);
      }
    }

    loadFavorites();
  }, [token]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleFavoriteClick = async (event, productId) => {
    event.stopPropagation();

    if (!token) {
      navigate("/login");
      return;
    }

    const isFavorite = favorites.includes(productId);

    try {
      if (isFavorite) {
        await removeFavorite(productId);

        setFavorites((current) =>
          current.filter((id) => id !== productId)
        );
      } else {
        await addFavorite(productId);

        setFavorites((current) => [
          ...current,
          productId,
        ]);
      }
    } catch (error) {
      console.error(
        "ERROR ACTUALIZANDO FAVORITO:",
        error
      );
    }
  };

  if (loading) {
    return (
      <section className="min-h-[60vh] bg-zinc-950 px-6 py-16">
        <div className="mx-auto max-w-7xl text-center text-zinc-400">
          Cargando ofertas...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-[60vh] bg-zinc-950 px-6 py-16">
        <div className="mx-auto max-w-7xl rounded-2xl border border-red-900/50 bg-zinc-900 p-10 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-zinc-950 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        {/* ENCABEZADO */}

        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-red-500">
            TECNO3D STORE
          </p>

          <h1 className="text-4xl font-black text-white md:text-5xl">
            Ofertas
          </h1>

          <p className="mt-3 text-zinc-500">
            Aprovechá nuestros productos con descuentos especiales.
          </p>
        </div>

        {/* SIN OFERTAS */}

        {products.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-zinc-400">
              Actualmente no hay productos en oferta.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const hasStock = product.stock > 0;

              const isFavorite = favorites.includes(
                product.id
              );

              const currentPrice =
                Number(product.offerPrice) > 0
                  ? Number(product.offerPrice)
                  : Number(product.price);

              return (
                <article
                  key={product.id}
                  onClick={() =>
                    handleProductClick(product.id)
                  }
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition duration-300 hover:-translate-y-1 hover:border-red-600"
                >
                  {/* IMAGEN */}

                  <div className="relative flex h-64 items-center justify-center overflow-hidden bg-zinc-950">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-center">
                        <ShoppingCart
                          size={40}
                          className="mx-auto text-zinc-700"
                        />

                        <p className="mt-2 text-sm text-zinc-600">
                          Sin imagen
                        </p>
                      </div>
                    )}

                    {/* DESCUENTO */}

                    <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
                      -
                      {Number(
                        product.offerPercentage || 0
                      )}
                      %
                    </span>

                    {/* FAVORITO */}

                    <button
                      type="button"
                      onClick={(event) =>
                        handleFavoriteClick(
                          event,
                          product.id
                        )
                      }
                      aria-label={
                        isFavorite
                          ? "Quitar de favoritos"
                          : "Agregar a favoritos"
                      }
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 backdrop-blur transition hover:scale-110 hover:border-red-600"
                    >
                      <Heart
                        size={21}
                        className={
                          isFavorite
                            ? "fill-red-600 text-red-600"
                            : "text-zinc-300"
                        }
                      />
                    </button>
                  </div>

                  {/* INFORMACIÓN */}

                  <div className="p-6">
                    {/* MARCA / CATEGORÍA */}

                    <div className="mb-3 flex flex-wrap gap-2">
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

                    <h2 className="text-xl font-bold text-white">
                      {product.name}
                    </h2>

                    {/* DESCRIPCIÓN */}

                    <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                      {product.description}
                    </p>

                    {/* PRECIO */}

                    <div className="mt-5">
                      <p className="text-sm text-zinc-500 line-through">
                        UYU{" "}
                        {Number(
                          product.price
                        ).toLocaleString("es-UY", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>

                      <div className="flex items-center gap-3">
                        <p className="text-3xl font-black text-green-400">
                          UYU{" "}
                          {currentPrice.toLocaleString(
                            "es-UY",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </p>

                        <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-black text-white">
                          OFERTA
                        </span>
                      </div>
                    </div>

                    {/* STOCK */}

                    <p
                      className={`mt-2 text-sm ${
                        hasStock
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {hasStock
                        ? `Stock disponible: ${product.stock}`
                        : "Sin stock"}
                    </p>

                    {/* ACCIÓN */}

                    <div className="mt-6 flex w-full items-center justify-center rounded-xl border border-zinc-700 py-3 font-semibold text-zinc-300 transition group-hover:border-red-600 group-hover:bg-red-600 group-hover:text-white">
                      Ver producto
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

