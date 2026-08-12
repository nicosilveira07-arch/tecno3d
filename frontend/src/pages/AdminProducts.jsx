import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  getProducts,
  deleteProduct,
} from "@/services/products.api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin = user?.role === "ADMIN";

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProducts();

      setProducts(response.data || []);
    } catch (error) {
      console.error(
        "ERROR CARGANDO PRODUCTOS:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudieron cargar los productos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "¿Seguro que querés eliminar este producto?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteProduct(id);

      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) => product.id !== id
        )
      );
    } catch (error) {
      console.error(
        "ERROR ELIMINANDO PRODUCTO:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo eliminar el producto."
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* ENCABEZADO */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <p className="mb-2 text-sm font-semibold text-red-500">
            Administración
          </p>

          <h1 className="text-3xl font-black text-white md:text-4xl">
            Productos
          </h1>

        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
        >
          <Plus size={18} />

          Agregar producto
        </Link>

      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* TABLA */}

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">

        {loading ? (
          <div className="p-8 text-center text-zinc-400">
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            No hay productos registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="border-b border-zinc-800 bg-zinc-950">

                <tr>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Producto
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Precio
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Stock
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Estado
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">
                    Acciones
                  </th>

                </tr>

              </thead>

              <tbody>

                {products.map((product) => (

                  <tr
                    key={product.id}
                    className="border-b border-zinc-800 last:border-0"
                  >

                    {/* PRODUCTO */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-4">

                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-800">

                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
                              Sin imagen
                            </div>
                          )}

                        </div>

                        <div>

                          <p className="font-semibold text-white">
                            {product.name}
                          </p>

                          <p className="text-xs text-zinc-500">
                            {product.slug}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* PRECIO */}

                    <td className="px-6 py-5 text-sm font-semibold text-white">
                      ${Number(product.price).toLocaleString(
                        "es-UY"
                      )}
                    </td>

                    {/* STOCK */}

                    <td className="px-6 py-5 text-sm text-zinc-300">
                      {product.stock}
                    </td>

                    {/* ESTADO */}

                    <td className="px-6 py-5">

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          product.status === "ACTIVE"
                            ? "border-green-500/20 bg-green-500/10 text-green-400"
                            : "border-zinc-700 bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {product.status}
                      </span>

                    </td>

                    {/* ACCIONES */}

                    <td className="px-6 py-5">

                      <div className="flex justify-end gap-2">

                        {/* EDITAR */}

                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          title="Editar producto"
                          className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          <Pencil size={17} />
                        </Link>

                        {/* ELIMINAR */}

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(product.id)
                            }
                            title="Eliminar producto"
                            className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

