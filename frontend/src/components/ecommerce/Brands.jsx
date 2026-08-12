import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBrands } from "@/services/brands.api";

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const response = await getBrands();

        setBrands(response.data || []);
      } catch (error) {
        console.error(
          "ERROR CARGANDO MARCAS:",
          error
        );

        setError(
          "No se pudieron cargar las marcas."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  const handleBrandClick = (brandId) => {
    navigate(`/products?brandId=${brandId}`);
  };

  return (
    <section className="bg-black px-6 py-20">
      <div className="mx-auto max-w-7xl">

        <h2 className="mb-10 text-center text-3xl font-bold text-white">
          Trabajamos con las mejores marcas
        </h2>

        {loading && (
          <p className="text-center text-zinc-500">
            Cargando marcas...
          </p>
        )}

        {error && (
          <p className="text-center text-red-500">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          brands.length === 0 && (
            <p className="text-center text-zinc-500">
              Todavía no hay marcas.
            </p>
          )}

        {!loading &&
          !error &&
          brands.length > 0 && (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-8">

              {brands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() =>
                    handleBrandClick(brand.id)
                  }
                  className="flex h-24 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 font-bold text-zinc-400 transition hover:-translate-y-1 hover:border-red-600 hover:text-white"
                >
                  {brand.name}
                </button>
              ))}

            </div>
          )}

      </div>
    </section>
  );
}