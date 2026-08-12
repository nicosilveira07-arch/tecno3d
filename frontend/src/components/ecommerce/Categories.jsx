import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Cpu,
  Monitor,
  Printer,
  Smartphone,
  Gamepad2,
  HardDrive,
  Mouse,
  Laptop,
  Tags,
} from "lucide-react";

import { getCategories } from "@/services/categories.api";

const getCategoryIcon = (name) => {
  const value = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (
    value.includes("pc gamer") ||
    value === "pc"
  ) {
    return Cpu;
  }

  if (
    value.includes("notebook") ||
    value.includes("laptop")
  ) {
    return Laptop;
  }

  if (
    value.includes("monitor") ||
    value.includes("pantalla")
  ) {
    return Monitor;
  }

  if (
    value.includes("impresora") ||
    value.includes("impresoras") ||
    value.includes("impresion 3d")
  ) {
    return Printer;
  }

  if (
    value.includes("celular") ||
    value.includes("telefono") ||
    value.includes("smartphone")
  ) {
    return Smartphone;
  }

  if (
    value.includes("gaming") ||
    value.includes("gamer") ||
    value.includes("videojuego")
  ) {
    return Gamepad2;
  }

  if (
    value.includes("mouse") ||
    value.includes("maus") ||
    value.includes("periferico") ||
    value.includes("teclado") ||
    value.includes("auricular") ||
    value.includes("webcam")
  ) {
    return Mouse;
  }

  if (
    value.includes("componente") ||
    value.includes("hardware") ||
    value.includes("placa de video") ||
    value.includes("gpu") ||
    value.includes("procesador") ||
    value.includes("memoria ram") ||
    value.includes("ram") ||
    value.includes("motherboard") ||
    value.includes("placa madre") ||
    value.includes("fuente")
  ) {
    return HardDrive;
  }

  return Tags;
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();

        setCategories(response.data || []);
      } catch (error) {
        console.error(
          "ERROR CARGANDO CATEGORÍAS:",
          error
        );

        setError(
          "No se pudieron cargar las categorías."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16">

        <h2 className="mb-10 text-3xl font-bold text-white">
          Categorías
        </h2>

        {loading && (
          <p className="text-zinc-500">
            Cargando categorías...
          </p>
        )}

        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          categories.length === 0 && (
            <p className="text-zinc-500">
              Todavía no hay categorías.
            </p>
          )}

        {!loading &&
          !error &&
          categories.length > 0 && (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">

              {categories.map((category) => {
                const Icon =
                  getCategoryIcon(category.name);

                return (
                  <Link
                    key={category.id}
                    to={`/products?categoryId=${category.id}`}
                    className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center transition hover:-translate-y-1 hover:border-red-600"
                  >
                    <Icon
                      size={42}
                      className="mx-auto text-red-600 transition group-hover:scale-110"
                    />

                    <h3 className="mt-5 font-semibold text-white">
                      {category.name}
                    </h3>
                  </Link>
                );
              })}

            </div>
          )}

      </div>
    </section>
  );
}