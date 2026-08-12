import { useEffect, useState } from "react";

import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "@/services/categories.api";

export default function Categories() {
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [editingName, setEditingName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

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

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getCategories();

      setCategories(
        response.data || []
      );
    } catch (error) {
      console.error(
        "ERROR CARGANDO CATEGORÍAS:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudieron cargar las categorías."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();

    const cleanName = name.trim();

    if (cleanName.length < 3) {
      setError(
        "La categoría debe tener mínimo 3 caracteres."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createCategory({
        name: cleanName,
        slug: generateSlug(cleanName),
        image: null,
      });

      setName("");

      await loadCategories();
    } catch (error) {
      console.error(
        "ERROR CREANDO CATEGORÍA:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo crear la categoría."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    const cleanName =
      editingName.trim();

    if (cleanName.length < 3) {
      setError(
        "La categoría debe tener mínimo 3 caracteres."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateCategory(id, {
        name: cleanName,
        slug: generateSlug(cleanName),
      });

      setEditingId(null);
      setEditingName("");

      await loadCategories();
    } catch (error) {
      console.error(
        "ERROR ACTUALIZANDO CATEGORÍA:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo actualizar la categoría."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "¿Seguro que querés eliminar esta categoría?"
      );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");

      await deleteCategory(id);

      await loadCategories();
    } catch (error) {
      console.error(
        "ERROR ELIMINANDO CATEGORÍA:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo eliminar la categoría."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ENCABEZADO */}

      <div>
        <p className="mb-2 text-sm font-semibold text-red-500">
          Administración
        </p>

        <h1 className="text-3xl font-black text-white md:text-4xl">
          Categorías
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Administrá las categorías de tus productos.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* CREAR */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

        <h2 className="mb-4 text-lg font-bold text-white">
          Nueva categoría
        </h2>

        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-3 md:flex-row"
        >

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Ej: Impresoras 3D"
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
          />

          <button
            type="submit"
            disabled={
              saving ||
              !name.trim()
            }
            className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
          >
            {saving
              ? "Guardando..."
              : "Agregar categoría"}
          </button>

        </form>

      </div>

      {/* LISTADO */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900">

        <div className="border-b border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-white">
            Categorías existentes
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-zinc-500">
            Cargando categorías...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-zinc-500">
            Todavía no hay categorías.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">

            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
              >

                {editingId === category.id ? (
                  <div className="flex flex-1 gap-3">

                    <input
                      type="text"
                      value={editingName}
                      onChange={(event) =>
                        setEditingName(
                          event.target.value
                        )
                      }
                      className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-white outline-none focus:border-red-600"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate(
                          category.id
                        )
                      }
                      disabled={saving}
                      className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white"
                    >
                      Guardar
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                        setError("");
                      }}
                      className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-300"
                    >
                      Cancelar
                    </button>

                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold text-white">
                        {category.name}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {category.products?.length || 0} productos
                      </p>
                    </div>

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(
                            category.id
                          );

                          setEditingName(
                            category.name
                          );

                          setError("");
                        }}
                        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            category.id
                          )
                        }
                        disabled={saving}
                        className="rounded-xl border border-red-900 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-950 disabled:opacity-50"
                      >
                        Eliminar
                      </button>

                    </div>
                  </>
                )}

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

