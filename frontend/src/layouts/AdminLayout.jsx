import {
  Home,
  Package,
  PlusCircle,
  ShoppingCart,
  Users,
  Tags,
  Ticket,
  Settings,
  LogOut,
  Image,
  Menu,
  X,
} from "lucide-react";

import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";

export default function AdminLayout() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: Home,
      roles: ["ADMIN"],
    },
    {
      label: "Productos",
      path: "/admin/products",
      icon: Package,
      roles: ["ADMIN", "EMPLOYEE"],
    },
    {
      label: "Agregar producto",
      path: "/admin/products/new",
      icon: PlusCircle,
      roles: ["ADMIN", "EMPLOYEE"],
    },
    {
      label: "Pedidos",
      path: "/admin/orders",
      icon: ShoppingCart,
      roles: ["ADMIN", "EMPLOYEE"],
    },
    {
      label: "Usuarios",
      path: "/admin/users",
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      label: "Categorías",
      path: "/admin/categories",
      icon: Tags,
      roles: ["ADMIN", "EMPLOYEE"],
    },
    {
      label: "Marcas",
      path: "/admin/brands",
      icon: Tags,
      roles: ["ADMIN", "EMPLOYEE"],
    },
    {
      label: "Banners",
      path: "/admin/banners",
      icon: Image,
      roles: ["ADMIN", "EMPLOYEE"],
    },
    {
      label: "Cupones",
      path: "/admin/coupons",
      icon: Ticket,
      roles: ["ADMIN"],
    },
    {
      label: "Configuración",
      path: "/admin/settings",
      icon: Settings,
      roles: ["ADMIN"],
    },
  ];

  const visibleMenuItems =
    menuItems.filter((item) =>
      item.roles.includes(user?.role)
    );

  const initials =
    user?.firstName?.charAt(0)?.toUpperCase() || "A";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
    window.location.reload();
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* BOTÓN MENÚ MOBILE */}

      <button
        type="button"
        onClick={() =>
          setSidebarOpen(true)
        }
        className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-white shadow-lg transition hover:bg-zinc-800 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      {/* OVERLAY MOBILE */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-800 bg-black transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:w-64 lg:translate-x-0`}
      >
        {/* HEADER SIDEBAR */}

        <div className="border-b border-zinc-800 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <Link
              to="/"
              onClick={closeSidebar}
              className="flex min-w-0 items-center gap-3"
            >
              <img
                src="/logo.png"
                alt="Tecno3D"
                className="h-12 w-auto sm:h-14"
              />

              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white sm:text-xl">
                  TECNO3D
                </h1>

                <p className="text-[10px] leading-tight text-zinc-400 sm:text-xs">
                  Impresión 3D & Tecnología
                </p>
              </div>
            </Link>

            {/* CERRAR MOBILE */}

            <button
              type="button"
              onClick={closeSidebar}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-900 hover:text-white lg:hidden"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>

          <p className="mt-4 text-xs text-zinc-500">
            Administración
          </p>
        </div>

        {/* USUARIO */}

        <div className="border-b border-zinc-800 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 font-bold">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-white">
                {user?.firstName
                  ? `${user.firstName} ${
                      user.lastName || ""
                    }`
                  : "Administrador"}
              </p>

              <p className="truncate text-xs text-zinc-500">
                {user?.email ||
                  "admin@tecno3d.com"}
              </p>

              <p
                className={`mt-1 text-xs font-bold ${
                  user?.role === "ADMIN"
                    ? "text-red-500"
                    : "text-blue-400"
                }`}
              >
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* MENÚ */}

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 sm:p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Menú
          </p>

          {visibleMenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`
                }
              >
                <Icon
                  size={19}
                  className="shrink-0"
                />

                <span className="truncate">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* CERRAR SESIÓN */}

        <div className="border-t border-zinc-800 p-3 sm:p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-900 hover:text-red-500"
          >
            <LogOut
              size={19}
              className="shrink-0"
            />

            <span>
              Cerrar sesión
            </span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}

      <main className="min-w-0 lg:ml-64">
        {/* ESPACIO PARA BOTÓN MOBILE */}

        <div className="p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

