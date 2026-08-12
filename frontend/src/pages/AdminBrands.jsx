import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  getBrands,
  createBrand,
  deleteBrand,
} from "@/services/brands.api";

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const loadBrands = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBrands();

      setBrands(response.data || []);
    } catch (error) {
      console.error(
        "ERROR CARGANDO MARCAS:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudieron cargar las marcas."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleNameChange = (event) => {
    const value = event.target.value;

    setName(value);
    setSlug(generateSlug(value));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await createBrand({
        name: name.trim(),
        slug: generateSlug(name),
      });

      setName("");
      setSlug("");

      await loadBrands();
    } catch (error) {
      console.error(
        "ERROR CREANDO MARCA:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo crear la marca."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "¿Seguro que querés eliminar esta marca?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteBrand(id);

      await loadBrands();
    } catch (error) {
      console.error(
        "ERROR ELIMINANDO MARCA:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo eliminar la marca."
      );
    }
  };

  return (
    <div>

      {/* ENCABEZADO */}

      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-red-500">
          Administración
        </p>

        <h1 className="text-3xl font-black text-white md:text-4xl">
          Marcas
        </h1>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* CREAR MARCA */}

      <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">

        <h2 className="mb-6 text-xl font-bold text-white">
          Agregar marca
        </h2>

        <form
          onSubmit={handleCreate}
          className="grid gap-5 md:grid-cols-2"
        >

          {/* NOMBRE */}

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Nombre de la marca
            </label>

            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Ej: ASUS"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
            />
          </div>

          {/* SLUG AUTOMÁTICO */}

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Identificador
            </label>

            <input
              type="text"
              value={slug}
              readOnly
              placeholder="Se genera automáticamente"
              className="w-full cursor-not-allowed rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-500 outline-none"
            />

            <p className="mt-2 text-xs text-zinc-600">
              Se genera automáticamente a partir del nombre.
            </p>
          </div>

          {/* BOTÓN */}

          <div className="md:col-span-2">

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
            >
              <Plus size={18} />

              {saving
                ? "Creando..."
                : "Agregar marca"}
            </button>

          </div>

        </form>

      </div>

      {/* LISTADO */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">

        <h2 className="mb-6 text-xl font-bold text-white">
          Marcas registradas
        </h2>

        {loading ? (
          <p className="text-zinc-500">
            Cargando marcas...
          </p>
        ) : brands.length === 0 ? (
          <p className="text-zinc-500">
            Todavía no hay marcas.
          </p>
        ) : (
          <div className="space-y-3">

            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >

                <div>
                  <p className="font-bold text-white">
                    {brand.name}
                  </p>

                  <p className="text-sm text-zinc-500">
                    /{brand.slug}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(brand.id)
                  }
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-950 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

