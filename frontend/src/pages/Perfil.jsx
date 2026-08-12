import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  Save,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/services/addresses.api";

import { changePassword } from "@/services/auth.api";

export default function Perfil() {
  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [user] = useState(storedUser);

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const [error, setError] = useState("");

  // =========================
  // CAMBIO DE CONTRASEÑA
  // =========================

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingPassword, setSavingPassword] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [addressForm, setAddressForm] = useState({
    title: "",
    street: "",
    number: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    isDefault: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      setError("");

      const response = await getAddresses();

      setAddresses(response.data || []);
    } catch (error) {
      console.error("ERROR CARGANDO DIRECCIONES:", error);

      setError(
        error.response?.data?.message ||
          "No se pudieron cargar las direcciones."
      );
    } finally {
      setLoadingAddresses(false);
    }
  };

  // =========================
  // DIRECCIONES
  // =========================

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;

    setAddressForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetAddressForm = () => {
    setAddressForm({
      title: "",
      street: "",
      number: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      isDefault: false,
    });

    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  const handleCreateAddress = () => {
    setEditingAddressId(null);

    setAddressForm({
      title: "",
      street: "",
      number: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      isDefault: addresses.length === 0,
    });

    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);

    setAddressForm({
      title: address.title || "",
      street: address.street || "",
      number: address.number || "",
      city: address.city || "",
      state: address.state || "",
      country: address.country || "",
      zipCode: address.zipCode || "",
      isDefault: address.isDefault || false,
    });

    setShowAddressForm(true);
  };

  const handleSaveAddress = async (event) => {
    event.preventDefault();

    try {
      setSavingAddress(true);
      setError("");

      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm);
      } else {
        await createAddress(addressForm);
      }

      await loadAddresses();

      resetAddressForm();
    } catch (error) {
      console.error("ERROR GUARDANDO DIRECCIÓN:", error);

      setError(
        error.response?.data?.message ||
          "No se pudo guardar la dirección."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    const confirmed = window.confirm(
      "¿Querés eliminar esta dirección?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteAddress(id);

      await loadAddresses();
    } catch (error) {
      console.error("ERROR ELIMINANDO DIRECCIÓN:", error);

      setError(
        error.response?.data?.message ||
          "No se pudo eliminar la dirección."
      );
    }
  };

  // =========================
  // CAMBIO DE CONTRASEÑA
  // =========================

  const handleOpenPasswordForm = () => {
    setShowPasswordForm(true);
    setPasswordError("");
    setPasswordMessage("");
  };

  const handleClosePasswordForm = () => {
    setShowPasswordForm(false);

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordError("");
    setPasswordMessage("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordMessage("");
  };

  const resetPasswordForm = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("Completá todos los campos.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError(
        "La nueva contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "Las nuevas contraseñas no coinciden."
      );
      return;
    }

    if (
      passwordForm.currentPassword ===
      passwordForm.newPassword
    ) {
      setPasswordError(
        "La nueva contraseña debe ser diferente a la contraseña actual."
      );
      return;
    }

    try {
      setSavingPassword(true);

      const response = await changePassword(passwordForm);

      setPasswordMessage(
        response.message ||
          "Contraseña actualizada correctamente."
      );

      resetPasswordForm();
    } catch (error) {
      console.error(
        "ERROR CAMBIANDO CONTRASEÑA:",
        error
      );

      setPasswordError(
        error.response?.data?.message ||
          "No se pudo cambiar la contraseña."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) {
    return (
      <section className="min-h-[70vh] bg-zinc-950 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <User
              size={48}
              className="mx-auto mb-4 text-zinc-600"
            />

            <h1 className="text-2xl font-black text-white">
              Sesión no encontrada
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Iniciá sesión para acceder a tu perfil.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim();

  const roleLabel =
    user.role === "ADMIN"
      ? "Administrador"
      : user.role === "EMPLOYEE"
      ? "Empleado"
      : "Cliente";

  return (
    <section className="min-h-[calc(100vh-134px)] bg-zinc-950 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
            Mi cuenta
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Mi perfil
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Administrá tus datos, seguridad y direcciones
            de entrega.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">

          {/* PERFIL */}

          <div className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

            <div className="flex flex-col items-center text-center">

              <div className="relative mb-5">

                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={fullName || "Usuario"}
                    className="h-28 w-28 rounded-full border-4 border-zinc-800 object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-zinc-800 bg-zinc-950">
                    <User
                      size={52}
                      className="text-zinc-600"
                    />
                  </div>
                )}

                <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-zinc-900 bg-red-600">
                  <User
                    size={14}
                    className="text-white"
                  />
                </div>

              </div>

              <h2 className="text-xl font-black text-white">
                {fullName || "Usuario"}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {user.email}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-900/60 bg-red-950/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
                <Shield size={14} />
                {roleLabel}
              </div>

            </div>

            <div className="my-6 h-px bg-zinc-800" />

            <div className="space-y-4">

              <div className="flex items-start gap-3">
                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-zinc-500"
                />

                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-zinc-600">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm text-zinc-300">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone
                  size={18}
                  className="mt-0.5 shrink-0 text-zinc-500"
                />

                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-600">
                    Teléfono
                  </p>

                  <p className="mt-1 text-sm text-zinc-300">
                    {user.phone || "No especificado"}
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="flex gap-3">
                <Lock
                  size={18}
                  className="mt-0.5 shrink-0 text-zinc-600"
                />

                <div>
                  <p className="text-sm font-semibold text-zinc-300">
                    Seguridad
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                    Mantené tu contraseña actualizada
                    para proteger tu cuenta.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* CONTENIDO */}

          <div className="space-y-6">

            {/* DATOS PERSONALES */}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">
                    Datos personales
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Información asociada a tu cuenta.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Nombre
                  </label>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
                    {user.firstName || "No especificado"}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Apellido
                  </label>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
                    {user.lastName || "No especificado"}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Email
                  </label>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
                    {user.email}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Teléfono
                  </label>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
                    {user.phone || "No especificado"}
                  </div>
                </div>

              </div>

            </div>

            {/* CAMBIAR CONTRASEÑA */}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600/10">
                    <Lock
                      size={20}
                      className="text-red-500"
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-white">
                      Cambiar contraseña
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Actualizá la contraseña de tu cuenta.
                    </p>
                  </div>
                </div>

                {!showPasswordForm && (
                  <button
                    type="button"
                    onClick={handleOpenPasswordForm}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    <Lock size={17} />
                    Cambiar contraseña
                  </button>
                )}

              </div>

              {passwordMessage && (
                <div className="mt-5 rounded-xl border border-emerald-900 bg-emerald-950/30 p-4 text-sm text-emerald-400">
                  {passwordMessage}
                </div>
              )}

              {showPasswordForm && (
                <form
                  onSubmit={handleChangePassword}
                  className="mt-6 space-y-5 border-t border-zinc-800 pt-6"
                >

                  {passwordError && (
                    <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-400">
                      {passwordError}
                    </div>
                  )}

                  {/* CONTRASEÑA ACTUAL */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-400">
                      Contraseña actual
                    </label>

                    <div className="relative">
                      <input
                        type={
                          showCurrentPassword
                            ? "text"
                            : "password"
                        }
                        name="currentPassword"
                        value={
                          passwordForm.currentPassword
                        }
                        onChange={handlePasswordChange}
                        placeholder="Ingresá tu contraseña actual"
                        autoComplete="current-password"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-red-600"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 transition hover:text-white"
                        aria-label={
                          showCurrentPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* NUEVA CONTRASEÑA */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-400">
                      Nueva contraseña
                    </label>

                    <div className="relative">
                      <input
                        type={
                          showNewPassword
                            ? "text"
                            : "password"
                        }
                        name="newPassword"
                        value={
                          passwordForm.newPassword
                        }
                        onChange={handlePasswordChange}
                        placeholder="Ingresá tu nueva contraseña"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-red-600"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowNewPassword(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 transition hover:text-white"
                        aria-label={
                          showNewPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-zinc-600">
                      La nueva contraseña debe tener al
                      menos 8 caracteres.
                    </p>
                  </div>

                  {/* CONFIRMAR CONTRASEÑA */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-400">
                      Confirmar nueva contraseña
                    </label>

                    <div className="relative">
                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        name="confirmPassword"
                        value={
                          passwordForm.confirmPassword
                        }
                        onChange={handlePasswordChange}
                        placeholder="Repetí tu nueva contraseña"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-red-600"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 transition hover:text-white"
                        aria-label={
                          showConfirmPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 pt-5 sm:flex-row sm:justify-end">

                    <button
                      type="button"
                      onClick={handleClosePasswordForm}
                      className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
                    >
                      <Lock size={17} />

                      {savingPassword
                        ? "Actualizando..."
                        : "Guardar nueva contraseña"}
                    </button>

                  </div>

                </form>
              )}

            </div>

            {/* DIRECCIONES */}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-xl font-black text-white">
                    Mis direcciones
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Administrá tus direcciones de entrega.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCreateAddress}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  <Plus size={18} />
                  Nueva dirección
                </button>

              </div>

              {loadingAddresses ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
                  <p className="text-sm text-zinc-500">
                    Cargando direcciones...
                  </p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 p-10 text-center">

                  <MapPin
                    size={42}
                    className="mx-auto mb-4 text-zinc-700"
                  />

                  <h3 className="font-bold text-zinc-300">
                    No tenés direcciones guardadas
                  </h3>

                  <p className="mt-1 text-sm text-zinc-600">
                    Agregá una dirección para facilitar
                    tus próximos pedidos.
                  </p>

                </div>
              ) : (
                <div className="grid gap-4">

                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`rounded-xl border p-5 transition ${
                        address.isDefault
                          ? "border-red-900/70 bg-red-950/10"
                          : "border-zinc-800 bg-zinc-950"
                      }`}
                    >

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="flex gap-4">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900">
                            <MapPin
                              size={21}
                              className={
                                address.isDefault
                                  ? "text-red-500"
                                  : "text-zinc-500"
                              }
                            />
                          </div>

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="font-bold text-white">
                                {address.title}
                              </h3>

                              {address.isDefault && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-600/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
                                  <Star
                                    size={11}
                                    fill="currentColor"
                                  />
                                  Principal
                                </span>
                              )}

                            </div>

                            <p className="mt-2 text-sm text-zinc-300">
                              {address.street}{" "}
                              {address.number}
                            </p>

                            <p className="mt-1 text-sm text-zinc-500">
                              {address.city},{" "}
                              {address.state}
                            </p>

                            <p className="mt-1 text-sm text-zinc-500">
                              {address.country} -{" "}
                              {address.zipCode}
                            </p>

                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:shrink-0">

                          <button
                            type="button"
                            onClick={() =>
                              handleEditAddress(address)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:border-zinc-700 hover:text-white"
                          >
                            <Pencil size={14} />
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteAddress(
                                address.id
                              )
                            }
                            className="inline-flex items-center justify-center rounded-lg border border-zinc-800 p-2 text-zinc-500 transition hover:border-red-900 hover:text-red-500"
                            title="Eliminar dirección"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>

        </div>

        {/* MODAL DIRECCIÓN */}

        {showAddressForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">

              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
                    Direcciones
                  </p>

                  <h2 className="mt-1 text-xl font-black text-white">
                    {editingAddressId
                      ? "Editar dirección"
                      : "Nueva dirección"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={resetAddressForm}
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                >
                  <X size={20} />
                </button>

              </div>

              <form
                onSubmit={handleSaveAddress}
                className="space-y-5 p-6"
              >

                <div className="grid gap-5 sm:grid-cols-2">

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-zinc-400">
                      Nombre de la dirección
                    </label>

                    <input
                      name="title"
                      value={addressForm.title}
                      onChange={handleAddressChange}
                      placeholder="Ej: Casa"
                      required
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-400">
                      Calle
                    </label>

                    <input
                      name="street"
                      value={addressForm.street}
                      onChange={handleAddressChange}
                      placeholder="Ej: Avenida Italia"
                      required
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-400">
                      Número
                    </label>

                    <input
                      name="number"
                      value={addressForm.number}
                      onChange={handleAddressChange}
                      placeholder="Ej: 1234"
                      required
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-400">
                      Ciudad
                    </label>

                    <input
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressChange}
                      placeholder="Ej: Montevideo"
                      required
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-400">
                      Departamento / Estado
                    </label>

                    <input
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressChange}
                      placeholder="Ej: Montevideo"
                      required
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-400">
                      País
                    </label>

                    <input
                      name="country"
                      value={addressForm.country}
                      onChange={handleAddressChange}
                      placeholder="Ej: Uruguay"
                      required
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-400">
                      Código postal
                    </label>

                    <input
                      name="zipCode"
                      value={addressForm.zipCode}
                      onChange={handleAddressChange}
                      placeholder="Ej: 11000"
                      required
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
                    />
                  </div>

                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4">

                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleAddressChange}
                    className="h-4 w-4 accent-red-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-zinc-300">
                      Establecer como dirección principal
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Será utilizada como dirección
                      predeterminada.
                    </p>
                  </div>

                </label>

                <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 pt-5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={resetAddressForm}
                    className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
                  >
                    <Save size={17} />

                    {savingAddress
                      ? "Guardando..."
                      : editingAddressId
                      ? "Guardar cambios"
                      : "Guardar dirección"}
                  </button>

                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

