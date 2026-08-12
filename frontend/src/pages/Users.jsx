import { useEffect, useState } from "react";

import {
  getUsers,
  createUser,
  updateUserRole,
} from "@/services/users.api";

export default function Users() {

  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");



  // PAGINACIÓN

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalUsers, setTotalUsers] =
    useState(0);



  // FILTROS

  const [search, setSearch] =
    useState("");

  const [role, setRole] =
    useState("");



  // CREAR USUARIO

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [creating, setCreating] =
    useState(false);



  // CAMBIAR ROL

  const [updatingRole, setUpdatingRole] =
    useState(null);



  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "EMPLOYEE",
  });



  // CARGAR USUARIOS

  const loadUsers = async () => {

    try {

      setLoading(true);
      setError("");



      const response = await getUsers({
        page,
        limit: 20,
        search,
        role,
      });



      setUsers(
        response.data?.users || []
      );



      setTotalUsers(
        response.data?.total || 0
      );



      setTotalPages(
        response.data?.totalPages || 1
      );

    } catch (error) {

      console.error(
        "ERROR CARGANDO USUARIOS:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudieron cargar los usuarios."
      );

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    loadUsers();

  }, [page, role]);



  // BUSCADOR

  const handleSearch = (event) => {

    event.preventDefault();

    setPage(1);

    loadUsers();

  };



  // FORMULARIO

  const handleFormChange = (event) => {

    const {
      name,
      value,
    } = event.target;



    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };



  // CREAR USUARIO

  const handleCreateUser = async (
    event
  ) => {

    event.preventDefault();



    try {

      setCreating(true);
      setError("");



      await createUser(form);



      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        role: "EMPLOYEE",
      });



      setShowCreateForm(false);

      setPage(1);

      await loadUsers();

    } catch (error) {

      console.error(
        "ERROR CREANDO USUARIO:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo crear el usuario."
      );

    } finally {

      setCreating(false);

    }

  };



  // CAMBIAR ROL

  const handleRoleChange = async (
    userId,
    newRole
  ) => {

    try {

      setUpdatingRole(userId);
      setError("");



      const response =
        await updateUserRole(
          userId,
          newRole
        );



      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                role:
                  response.data?.role ||
                  newRole,
              }
            : user
        )
      );

    } catch (error) {

      console.error(
        "ERROR ACTUALIZANDO ROL:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo actualizar el rol."
      );

    } finally {

      setUpdatingRole(null);

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
            Usuarios
          </h1>

        </div>



        <button
          type="button"
          onClick={() =>
            setShowCreateForm(
              !showCreateForm
            )
          }
          className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
        >
          {showCreateForm
            ? "Cancelar"
            : "Agregar usuario"}
        </button>

      </div>



      {/* BUSCADOR Y FILTROS */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-4 md:flex-row"
        >

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Buscar por nombre, apellido o email..."
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
          />



          <select
            value={role}
            onChange={(event) => {

              setRole(event.target.value);
              setPage(1);

            }}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
          >

            <option value="">
              Todos los roles
            </option>

            <option value="ADMIN">
              ADMIN
            </option>

            <option value="EMPLOYEE">
              EMPLOYEE
            </option>

            <option value="CUSTOMER">
              CUSTOMER
            </option>

          </select>



          <button
            type="submit"
            className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
          >
            Buscar
          </button>

        </form>

      </div>



      {/* FORMULARIO CREAR */}

      {showCreateForm && (

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">

          <h2 className="mb-6 text-xl font-bold text-white">
            Crear usuario
          </h2>



          <form
            onSubmit={handleCreateUser}
            className="grid gap-5 md:grid-cols-2"
          >

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Nombre
              </label>

              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleFormChange}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
              />

            </div>



            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Apellido
              </label>

              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleFormChange}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
              />

            </div>



            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleFormChange}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
              />

            </div>



            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Teléfono
              </label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
              />

            </div>



            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Contraseña
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleFormChange}
                required
                minLength={8}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
              />

            </div>



            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Rol
              </label>

              <select
                name="role"
                value={form.role}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-600"
              >

                <option value="CUSTOMER">
                  CUSTOMER
                </option>

                <option value="EMPLOYEE">
                  EMPLOYEE
                </option>

                <option value="ADMIN">
                  ADMIN
                </option>

              </select>

            </div>



            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
              >
                {creating
                  ? "Creando usuario..."
                  : "Crear usuario"}
              </button>

            </div>

          </form>

        </div>

      )}



      {/* ERROR */}

      {error && (

        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400">
          {error}
        </div>

      )}



      {/* TOTAL */}

      <div className="flex items-center justify-between">

        <p className="text-sm text-zinc-500">

          Total de usuarios:

          <span className="ml-2 font-bold text-white">
            {totalUsers}
          </span>

        </p>

        <p className="text-sm text-zinc-500">

          Página {page} de {totalPages}

        </p>

      </div>



      {/* TABLA */}

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">

        {loading ? (

          <div className="p-8 text-center text-zinc-400">
            Cargando usuarios...
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="border-b border-zinc-800 bg-zinc-950">

                <tr>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Usuario
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Email
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Teléfono
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Rol
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Registro
                  </th>

                </tr>

              </thead>



              <tbody>

                {users.length === 0 ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-zinc-500"
                    >
                      No se encontraron usuarios.
                    </td>

                  </tr>

                ) : (

                  users.map((user) => (

                    <tr
                      key={user.id}
                      className="border-b border-zinc-800 last:border-0"
                    >

                      <td className="px-6 py-5">

                        <p className="font-semibold text-white">
                          {user.firstName}{" "}
                          {user.lastName}
                        </p>

                        <p className="text-xs text-zinc-500">
                          {user.id}
                        </p>

                      </td>



                      <td className="px-6 py-5 text-sm text-zinc-300">
                        {user.email}
                      </td>



                      <td className="px-6 py-5 text-sm text-zinc-400">
                        {user.phone ||
                          "Sin teléfono"}
                      </td>



                      <td className="px-6 py-5">

                        <select
                          value={user.role}
                          disabled={
                            updatingRole ===
                            user.id
                          }
                          onChange={(event) =>
                            handleRoleChange(
                              user.id,
                              event.target.value
                            )
                          }
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold outline-none ${
                            user.role === "ADMIN"
                              ? "border-red-500/20 bg-red-500/10 text-red-400"
                              : user.role ===
                                "EMPLOYEE"
                              ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                              : "border-zinc-700 bg-zinc-800 text-zinc-300"
                          }`}
                        >

                          <option value="CUSTOMER">
                            CUSTOMER
                          </option>

                          <option value="EMPLOYEE">
                            EMPLOYEE
                          </option>

                          <option value="ADMIN">
                            ADMIN
                          </option>

                        </select>

                      </td>



                      <td className="px-6 py-5 text-sm text-zinc-400">

                        {new Date(
                          user.createdAt
                        ).toLocaleDateString(
                          "es-UY"
                        )}

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        )}

      </div>



      {/* PAGINACIÓN */}

      {!loading &&
        totalPages > 1 && (

          <div className="flex items-center justify-center gap-3">

            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                setPage(
                  (prev) =>
                    prev - 1
                )
              }
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Anterior
            </button>



            <span className="text-sm text-zinc-400">
              Página {page} de {totalPages}
            </span>



            <button
              type="button"
              disabled={
                page === totalPages
              }
              onClick={() =>
                setPage(
                  (prev) =>
                    prev + 1
                )
              }
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente →
            </button>

          </div>

        )}

    </div>

  );

}

