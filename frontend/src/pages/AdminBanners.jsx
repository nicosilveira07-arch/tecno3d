import { useEffect, useState } from "react";

import {
  Image,
  Upload,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  X,
} from "lucide-react";

import { uploadImage } from "@/services/upload.api";

import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "@/services/banner.api";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("Comprar ahora");
  const [link, setLink] = useState("/offers");

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [editingBannerId, setEditingBannerId] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBanners();

      setBanners(response?.data || []);
    } catch (error) {
      console.error("ERROR CARGANDO BANNERS:", error);

      setError(
        error.response?.data?.message ||
          "No se pudieron cargar los banners."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setButtonText("Comprar ahora");
    setLink("/offers");

    setImage(null);
    setImagePreview("");

    setEditingBannerId(null);
  };

  const handleCreateBanner = async (event) => {
    event.preventDefault();

    setError("");

    if (!image) {
      setError("Seleccioná una imagen para el banner.");
      return;
    }

    if (!title.trim()) {
      setError("Ingresá un título para el banner.");
      return;
    }

    try {
      setUploading(true);

      // 1. Subir imagen a Cloudinary
      const uploadResult = await uploadImage(image);

      const imageUrl = uploadResult?.data?.[0]?.url;

      if (!imageUrl) {
        throw new Error(
          "No se pudo obtener la URL de la imagen."
        );
      }

      // 2. Crear banner
      const response = await createBanner({
        title: title.trim(),
        description: description.trim(),
        buttonText:
          buttonText.trim() || "Comprar ahora",
        link: link.trim() || "/offers",
        image: imageUrl,
        active: true,
      });

      const createdBanner = response?.data;

      if (!createdBanner) {
        throw new Error(
          "El banner no fue creado correctamente."
        );
      }

      // 3. Agregarlo al listado
      setBanners((previous) => [
        createdBanner,
        ...previous,
      ]);

      // 4. Limpiar formulario
      resetForm();

      event.target.reset();
    } catch (error) {
      console.error(
        "ERROR CREANDO BANNER:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "No se pudo crear el banner."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleEditBanner = (banner) => {
    setError("");

    setEditingBannerId(banner.id);

    setTitle(banner.title || "");
    setDescription(banner.description || "");
    setButtonText(
      banner.buttonText || "Comprar ahora"
    );
    setLink(banner.link || "/offers");

    setImage(null);
    setImagePreview(banner.image || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleUpdateBanner = async (event) => {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Ingresá un título para el banner.");
      return;
    }

    try {
      setUploading(true);

      let imageUrl = imagePreview;

      // Si seleccionó una nueva imagen,
      // primero la subimos a Cloudinary.
      if (image) {
        const uploadResult = await uploadImage(image);

        imageUrl = uploadResult?.data?.[0]?.url;

        if (!imageUrl) {
          throw new Error(
            "No se pudo obtener la URL de la nueva imagen."
          );
        }
      }

      const response = await updateBanner(
        editingBannerId,
        {
          title: title.trim(),
          description: description.trim(),
          buttonText:
            buttonText.trim() || "Comprar ahora",
          link: link.trim() || "/offers",
          image: imageUrl,
        }
      );

      const updatedBanner = response?.data;

      if (!updatedBanner) {
        throw new Error(
          "El banner no fue actualizado correctamente."
        );
      }

      setBanners((previous) =>
        previous.map((banner) =>
          banner.id === editingBannerId
            ? updatedBanner
            : banner
        )
      );

      resetForm();
    } catch (error) {
      console.error(
        "ERROR ACTUALIZANDO BANNER:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "No se pudo actualizar el banner."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleToggleBanner = async (banner) => {
    try {
      setError("");

      const response = await updateBanner(
        banner.id,
        {
          active: !banner.active,
        }
      );

      const updatedBanner = response?.data;

      setBanners((previous) =>
        previous.map((item) =>
          item.id === banner.id
            ? updatedBanner
            : item
        )
      );
    } catch (error) {
      console.error(
        "ERROR ACTUALIZANDO BANNER:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo actualizar el banner."
      );
    }
  };

  const handleDeleteBanner = async (id) => {
    try {
      setError("");

      await deleteBanner(id);

      setBanners((previous) =>
        previous.filter(
          (banner) => banner.id !== id
        )
      );

      if (editingBannerId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(
        "ERROR ELIMINANDO BANNER:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo eliminar el banner."
      );
    }
  };

  return (
    <div>
      {/* ENCABEZADO */}

      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
          Administración
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Banners
        </h1>

        <p className="mt-2 text-zinc-500">
          Administrá las promociones que aparecen
          en el carrusel principal de la tienda.
        </p>
      </div>

      {/* CREAR / EDITAR */}

      <div className="grid gap-8 xl:grid-cols-2">
        {/* FORMULARIO */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-500">
                {editingBannerId ? (
                  <Pencil size={20} />
                ) : (
                  <Plus size={20} />
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingBannerId
                    ? "Editar banner"
                    : "Nuevo banner"}
                </h2>

                <p className="text-sm text-zinc-500">
                  {editingBannerId
                    ? "Modificá la promoción existente."
                    : "Creá una nueva promoción."}
                </p>
              </div>
            </div>

            {editingBannerId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:border-red-600 hover:text-white"
              >
                <X size={17} />
                Cancelar
              </button>
            )}
          </div>

          <form
            onSubmit={
              editingBannerId
                ? handleUpdateBanner
                : handleCreateBanner
            }
            className="space-y-5"
          >
            {/* IMAGEN */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Imagen
              </label>

              <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-zinc-700 bg-zinc-950 transition hover:border-red-600">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <>
                    <Upload
                      size={32}
                      className="mb-3 text-zinc-600"
                    />

                    <span className="text-sm font-semibold text-zinc-400">
                      Seleccionar imagen
                    </span>

                    <span className="mt-1 text-xs text-zinc-600">
                      La imagen se subirá a Cloudinary
                    </span>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {editingBannerId && (
                <p className="mt-2 text-xs text-zinc-600">
                  Si no seleccionás una nueva imagen,
                  se conservará la actual.
                </p>
              )}
            </div>

            {/* TITULO */}

            <div>
              <label
                htmlFor="banner-title"
                className="mb-2 block text-sm font-semibold text-white"
              >
                Título
              </label>

              <input
                id="banner-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Hasta 40% OFF"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600"
              />
            </div>

            {/* DESCRIPCIÓN */}

            <div>
              <label
                htmlFor="banner-description"
                className="mb-2 block text-sm font-semibold text-white"
              >
                Descripción
              </label>

              <textarea
                id="banner-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                rows={3}
                placeholder="Aprovechá descuentos exclusivos..."
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600"
              />
            </div>

            {/* BOTÓN */}

            <div>
              <label
                htmlFor="banner-button"
                className="mb-2 block text-sm font-semibold text-white"
              >
                Texto del botón
              </label>

              <input
                id="banner-button"
                type="text"
                value={buttonText}
                onChange={(event) =>
                  setButtonText(
                    event.target.value
                  )
                }
                placeholder="Comprar ahora"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600"
              />
            </div>

            {/* DESTINO */}

            <div>
              <label
                htmlFor="banner-link"
                className="mb-2 block text-sm font-semibold text-white"
              >
                Destino
              </label>

              <input
                id="banner-link"
                type="text"
                value={link}
                onChange={(event) =>
                  setLink(event.target.value)
                }
                placeholder="/offers"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600"
              />
            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* GUARDAR */}

            <button
              type="submit"
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
            >
              {editingBannerId ? (
                <Pencil size={18} />
              ) : (
                <Upload size={18} />
              )}

              {uploading
                ? "Guardando..."
                : editingBannerId
                  ? "Guardar cambios"
                  : "Crear banner"}
            </button>
          </form>
        </div>

        {/* PREVISUALIZACIÓN */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-500">
              <Image size={20} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                Vista previa
              </h2>

              <p className="text-sm text-zinc-500">
                Así se verá el banner.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Banner"
                className="h-64 w-full object-cover"
              />
            ) : (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <Image
                    size={45}
                    className="mx-auto text-zinc-700"
                  />

                  <p className="mt-3 text-sm text-zinc-600">
                    Seleccioná una imagen
                  </p>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

            <div className="absolute inset-0 flex max-w-lg flex-col justify-center p-8">
              {title && (
                <h3 className="text-3xl font-black text-white">
                  {title}
                </h3>
              )}

              {description && (
                <p className="mt-3 text-sm text-zinc-300">
                  {description}
                </p>
              )}

              {buttonText && (
                <div className="mt-5 w-fit rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white">
                  {buttonText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BANNERS */}

      <div className="mt-10">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-white">
            Banners creados
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Administrá las promociones del carrusel.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-sm text-zinc-500">
              Cargando banners...
            </p>
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <Image
              size={40}
              className="mx-auto text-zinc-700"
            />

            <p className="mt-4 font-semibold text-white">
              Todavía no hay banners.
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Creá el primero usando el formulario.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
              >
                <div className="relative">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="h-56 w-full object-cover"
                  />

                  <div
                    className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white ${
                      banner.active
                        ? "bg-red-600"
                        : "bg-zinc-700"
                    }`}
                  >
                    {banner.active
                      ? "ACTIVO"
                      : "INACTIVO"}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-white">
                    {banner.title}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-500">
                    {banner.description}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {/* EDITAR */}

                    <button
                      type="button"
                      onClick={() =>
                        handleEditBanner(banner)
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-3 py-3 text-sm font-semibold text-white transition hover:border-red-600 hover:text-red-500"
                    >
                      <Pencil size={17} />
                      Editar
                    </button>

                    {/* ACTIVAR / DESACTIVAR */}

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleBanner(banner)
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-3 py-3 text-sm font-semibold text-white transition hover:border-red-600"
                    >
                      {banner.active ? (
                        <>
                          <EyeOff size={17} />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Eye size={17} />
                          Activar
                        </>
                      )}
                    </button>

                    {/* ELIMINAR */}

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteBanner(
                          banner.id
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-900/50 px-3 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-950/40"
                    >
                      <Trash2 size={17} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}