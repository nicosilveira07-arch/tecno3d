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

// ICONO PERSONALIZADO DE MATE
const MateIcon = ({ size = 42, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bombilla */}
      <path
        d="M38 8L51 21"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M51 21L55 17"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Mate */}
      <path
        d="M16 25C16 21.6863 18.6863 19 22 19H42C45.3137 19 48 21.6863 48 25V29C48 43.3594 40.8366 52 32 52C23.1634 52 16 43.3594 16 29V25Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Boca del mate */}
      <path
        d="M17 25H47"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Yerba */}
      <path
        d="M22 24C25 21 29 24 32 21C35 18 39 23 43 21"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

const getCategoryIcon = (name) => {
  const value = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // MATE / MATES / MATE Y ACCESORIOS
  if (value.includes("mate")) {
    return MateIcon;
  }

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

        const allCategories = response.data || [];

        const featuredCategories = allCategories.filter(
          (category) => category.featured === true
        );

        setCategories(featuredCategories);
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
              Todavía no hay categorías destacadas.
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