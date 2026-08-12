import { useEffect, useState } from "react";
import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
getFavorites,
removeFavorite,
} from "@/services/favorites.api";

import { addToCart } from "@/features/cart/cart.store";

export default function Favorites() {
const navigate = useNavigate();

const [favorites, setFavorites] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [addedProduct, setAddedProduct] = useState(null);

useEffect(() => {
const loadFavorites = async () => {
try {
const response = await getFavorites();


    setFavorites(response.data || []);
  } catch (error) {
    console.error(
      "ERROR CARGANDO FAVORITOS:",
      error
    );

    setError(
      "No se pudieron cargar tus favoritos."
    );
  } finally {
    setLoading(false);
  }
};

loadFavorites();


}, []);

const handleRemoveFavorite = async (
event,
productId
) => {
event.stopPropagation();


try {
  await removeFavorite(productId);

  setFavorites((previous) =>
    previous.filter(
      (favorite) =>
        favorite.productId !== productId
    )
  );
} catch (error) {
  console.error(
    "ERROR ELIMINANDO FAVORITO:",
    error
  );
}


};

const handleAddToCart = (event, product) => {
event.stopPropagation();


if (product.stock <= 0) {
  return;
}

addToCart(product);

setAddedProduct(product.id);

setTimeout(() => {
  setAddedProduct(null);
}, 1500);


};

const handleProductClick = (productId) => {
navigate(`/products/${productId}`);
};

return ( <section className="min-h-screen bg-zinc-950 px-6 py-12"> <div className="mx-auto max-w-7xl">

    {/* ENCABEZADO */}

    <div className="mb-10 flex items-center gap-4">
      <div className="rounded-full bg-red-600/10 p-3">
        <Heart
          size={28}
          className="text-red-500"
          fill="currentColor"
        />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-white">
          Mis favoritos
        </h1>

        <p className="mt-1 text-zinc-500">
          Productos que guardaste para más tarde.
        </p>
      </div>
    </div>

    {/* CARGANDO */}

    {loading && (
      <p className="text-zinc-500">
        Cargando favoritos...
      </p>
    )}

    {/* ERROR */}

    {!loading && error && (
      <p className="text-red-500">
        {error}
      </p>
    )}

    {/* SIN FAVORITOS */}

    {!loading &&
      !error &&
      favorites.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-16 text-center">

          <Heart
            size={48}
            className="mx-auto mb-4 text-zinc-700"
          />

          <h2 className="text-xl font-semibold text-white">
            Todavía no tenés favoritos
          </h2>

          <p className="mt-2 text-zinc-500">
            Guardá productos con el corazón para
            encontrarlos fácilmente acá.
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Ver productos
          </button>

        </div>
      )}

    {/* FAVORITOS */}

    {!loading &&
      !error &&
      favorites.length > 0 && (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {favorites.map((favorite) => {
            const product = favorite.product;

            if (!product) {
              return null;
            }

            const reviews =
              product.reviews || [];

            const reviewCount =
              reviews.length;

            const averageRating =
              reviewCount > 0
                ? reviews.reduce(
                    (total, review) =>
                      total +
                      Number(review.rating),
                    0
                  ) / reviewCount
                : 0;

            const roundedRating =
              Math.round(averageRating);

            const stockText =
              product.stock > 5
                ? "Disponible"
                : product.stock > 0
                ? "Últimas unidades"
                : "Sin stock";

            return (
              <div
                key={favorite.id}
                onClick={() =>
                  handleProductClick(
                    product.id
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
                      className="h-72 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-72 w-full items-center justify-center bg-zinc-950 text-zinc-600">
                      Sin imagen
                    </div>
                  )}

                  {/* QUITAR FAVORITO */}

                  <button
                    type="button"
                    onClick={(event) =>
                      handleRemoveFavorite(
                        event,
                        product.id
                      )
                    }
                    className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-red-500 transition hover:bg-red-600 hover:text-white"
                    aria-label="Quitar de favoritos"
                  >
                    <Heart
                      size={18}
                      fill="currentColor"
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

                  {/* NOMBRE */}

                  <h2 className="mb-2 text-lg font-semibold text-white transition group-hover:text-red-500">
                    {product.name}
                  </h2>

                  {/* ESTRELLAS */}

                  {reviewCount > 0 ? (
                    <div className="mb-3 flex items-center gap-2">

                      <div className="flex">
                        {Array.from({
                          length: 5,
                        }).map((_, index) => (
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
                        ))}
                      </div>

                      <span className="text-xs text-zinc-500">
                        {averageRating.toFixed(1)}{" "}
                        ({reviewCount})
                      </span>

                    </div>
                  ) : (
                    <div className="mb-3 flex items-center gap-2">

                      <div className="flex">
                        {Array.from({
                          length: 5,
                        }).map((_, index) => (
                          <Star
                            key={index}
                            size={16}
                            className="text-zinc-700"
                          />
                        ))}
                      </div>

                      <span className="text-xs text-zinc-600">
                        Sin reseñas
                      </span>

                    </div>
                  )}

                  {/* PRECIO */}

                  <div className="text-2xl font-black text-red-500">
                    UYU{" "}
                    {Number(
                      product.price
                    ).toLocaleString("es-UY")}
                  </div>

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
                    <ShoppingCart size={18} />

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
