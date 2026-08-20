import {
  Home,
  Package,
  PlusCircle,
  ShoppingCart,
  Users,
  Tags,
  Ticket,
  FileText,
  Settings,
  LogOut,
  Image,
} from "lucide-react";

import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: Home,
      roles: ["ADMIN", "EMPLOYEE"],
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

  const visibleMenuItems = menuItems.filter((item) =>
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* SIDEBAR */}

      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-800 bg-black">
        {/* LOGO */}

        <div className="border-b border-zinc-800 p-6">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <img
              src="/logo.png"
              alt="Tecno3D"
              className="h-14"
            />

            <div>
              <h1 className="text-xl font-bold text-white">
                TECNO3D
              </h1>

              <p className="text-xs text-zinc-400">
                Impresión 3D & Tecnología
              </p>
            </div>
          </Link>

          <p className="mt-4 text-xs text-zinc-500">
            Administración
          </p>
        </div>

        {/* USUARIO */}

        <div className="border-b border-zinc-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 font-bold">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-white">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ""}`
                  : "Administrador"}
              </p>

              <p className="truncate text-xs text-zinc-500">
                {user?.email || "admin@tecno3d.com"}
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

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
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
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />

                <span>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* CERRAR SESIÓN */}

        <div className="border-t border-zinc-800 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-900 hover:text-red-500"
          >
            <LogOut size={18} />

            <span>
              Cerrar sesión
            </span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}

      <main className="ml-64 min-w-0">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}