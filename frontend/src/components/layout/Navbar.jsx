import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  ChevronDown,
  LogOut,
  Shield,
  Package,
  X,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import { useCart } from "@/features/cart/cart.store";
import { getCategories } from "@/services/categories.api";
import { getFavorites } from "@/services/favorites.api";

export default function Navbar() {
  const navigate = useNavigate();

  const cart = useCart();

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const token = localStorage.getItem("token");

  const storedUser = localStorage.getItem("user");

  let user = null;

  if (storedUser && storedUser !== "undefined") {
    try {
      user = JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("user");
      user = null;
    }
  }

  const isAdmin =
    user?.role === "ADMIN" ||
    user?.role === "EMPLOYEE";

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] =
    useState(false);

  const [showMobileMenu, setShowMobileMenu] =
    useState(false);

  const [showMobileCategories, setShowMobileCategories] =
    useState(false);

  // =========================
  // FAVORITOS
  // =========================

  const [favoriteCount, setFavoriteCount] =
    useState(0);

  const [showFavoriteNotification, setShowFavoriteNotification] =
    useState(false);

  const favoriteTimeoutRef = useRef(null);

  const categoriesRef = useRef(null);

  // =========================
  // CERRAR CATEGORÍAS
  // =========================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target)
      ) {
        setShowCategories(false);
        setShowMobileCategories(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================
  // CARGAR CATEGORÍAS
  // =========================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();

        setCategories(response.data || []);
      } catch (error) {
        console.error(
          "ERROR CARGANDO CATEGORÍAS DEL NAVBAR:",
          error
        );
      }
    };

    loadCategories();
  }, []);

  // =========================
  // CARGAR FAVORITOS INICIALES
  // =========================

  useEffect(() => {
    const loadFavorites = async () => {
      if (!token) {
        setFavoriteCount(0);
        return;
      }

      try {
        const response = await getFavorites();

        const favorites = response.data || [];

        setFavoriteCount(favorites.length);
      } catch (error) {
        console.error(
          "ERROR CARGANDO FAVORITOS DEL NAVBAR:",
          error
        );

        setFavoriteCount(0);
      }
    };

    loadFavorites();
  }, [token]);

  // =========================
  // ACTUALIZAR FAVORITOS
  // =========================

  useEffect(() => {
    const handleFavoriteUpdated = async () => {
      const currentToken =
        localStorage.getItem("token");

      if (!currentToken) {
        setFavoriteCount(0);
        return;
      }

      try {
        const response = await getFavorites();

        const favorites = response.data || [];

        setFavoriteCount(favorites.length);

        setShowFavoriteNotification(true);

        if (favoriteTimeoutRef.current) {
          clearTimeout(
            favoriteTimeoutRef.current
          );
        }

        favoriteTimeoutRef.current = setTimeout(() => {
          setShowFavoriteNotification(false);
        }, 3000);
      } catch (error) {
        console.error(
          "ERROR ACTUALIZANDO FAVORITOS DEL NAVBAR:",
          error
        );
      }
    };

    window.addEventListener(
      "favorite-added",
      handleFavoriteUpdated
    );

    window.addEventListener(
      "favorite-removed",
      handleFavoriteUpdated
    );

    return () => {
      window.removeEventListener(
        "favorite-added",
        handleFavoriteUpdated
      );

      window.removeEventListener(
        "favorite-removed",
        handleFavoriteUpdated
      );

      if (favoriteTimeoutRef.current) {
        clearTimeout(
          favoriteTimeoutRef.current
        );
      }
    };
  }, []);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
    window.location.reload();
  };

  // =========================
  // BUSCADOR
  // =========================

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      navigate("/products");
      return;
    }

    navigate(
      `/products?search=${encodeURIComponent(value)}`
    );

    setShowMobileMenu(false);
  };

  // =========================
  // CATEGORÍA
  // =========================

  const handleCategorySearch = (category) => {
    setShowCategories(false);
    setShowMobileCategories(false);
    setShowMobileMenu(false);

    navigate(
      `/products?categoryId=${encodeURIComponent(
        category.id
      )}`
    );
  };

  return (
    <>
      {/* NAVBAR FIJO */}

      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 shadow-lg backdrop-blur-md">

        {/* Barra superior */}

        <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 sm:px-6">

          {/* Logo */}

          <Link
            to="/"
            onClick={() => setShowMobileMenu(false)}
            className="flex shrink-0 items-center gap-3"
          >
            <img
              src="/logo.png"
              alt="Tecno3D"
              className="h-12 sm:h-14"
            />

            <div className="hidden lg:block">
              <h2 className="text-xl font-bold text-white">
                TECNO3D
              </h2>

              <p className="text-xs text-zinc-400">
                Impresión 3D & Tecnología
              </p>
            </div>
          </Link>

          {/* Buscador */}

          <form
            onSubmit={handleSearch}
            className="flex min-w-0 flex-1"
          >
            <div className="relative w-full">

              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar productos..."
                className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-900 pl-12 pr-4 text-sm text-white outline-none transition focus:border-red-600"
              />

            </div>
          </form>

          {/* Acciones desktop */}

          <div className="hidden items-center gap-6 lg:flex">

            {/* Favoritos */}

            <Link
              to="/favorites"
              aria-label="Mis favoritos"
              className="relative"
            >
              <Heart
                className="cursor-pointer text-zinc-300 transition hover:text-red-600"
              />

              {showFavoriteNotification && (
                <span className="absolute -right-3 -top-3 flex h-5 min-w-5 animate-pulse items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                  {favoriteCount}
                </span>
              )}
            </Link>

            {/* Carrito */}

            <Link
              to="/cart"
              className="relative"
            >
              <ShoppingCart className="cursor-pointer text-zinc-300 transition hover:text-red-600" />

              {cartCount > 0 && (
                <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Administrador */}

            {token && isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-red-500"
              >
                <Shield size={20} />

                <span>
                  Administrador
                </span>
              </Link>
            )}

            {/* Usuario */}

            {token ? (
              <div className="flex items-center gap-4">

                <Link
                  to="/orders"
                  className="flex items-center gap-2 text-zinc-300 transition hover:text-red-500"
                >
                  <Package size={21} />

                  <span className="hidden xl:block text-sm font-medium">
                    Mis Compras
                  </span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-zinc-300 transition hover:text-red-500"
                >
                  <User size={22} />

                  <span className="hidden xl:block text-sm font-medium">
                    {user?.firstName || "Mi cuenta"}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="text-zinc-300 transition hover:text-red-500"
                >
                  <LogOut size={21} />
                </button>

              </div>
            ) : (
              <Link
                to="/login"
                aria-label="Iniciar sesión"
              >
                <User className="cursor-pointer text-zinc-300 transition hover:text-red-600" />
              </Link>
            )}

          </div>

          {/* Menú móvil */}

          <button
            onClick={() =>
              setShowMobileMenu(!showMobileMenu)
            }
            className="shrink-0 text-zinc-300 transition hover:text-red-500 lg:hidden"
            aria-label="Abrir menú"
          >
            {showMobileMenu ? (
              <X size={28} />
            ) : (
              <Menu size={28} />
            )}
          </button>

        </div>

        {/* Menú desktop */}

        <div className="hidden border-t border-zinc-800 lg:block">

          <div className="mx-auto flex h-14 max-w-7xl items-center gap-8 px-6 text-sm">

            {/* Categorías */}

            <div
              ref={categoriesRef}
              className="relative"
            >

              <button
                onClick={() =>
                  setShowCategories(
                    !showCategories
                  )
                }
                className="flex items-center gap-2 text-white transition hover:text-red-500"
              >
                Categorías

                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    showCategories
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {showCategories && (
                <div className="absolute left-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">

                  {categories.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-zinc-500">
                      No hay categorías.
                    </div>
                  ) : (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() =>
                          handleCategorySearch(
                            category
                          )
                        }
                        className="block w-full px-4 py-3 text-left text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-red-500"
                      >
                        {category.name}
                      </button>
                    ))
                  )}

                </div>
              )}

            </div>

            {/* Productos */}

            <Link
              to="/products"
              className="text-zinc-300 transition hover:text-red-500"
            >
              Productos
            </Link>

            {/* Ofertas */}

            <Link
              to="/offers"
              className="font-semibold text-red-500 transition hover:text-red-400"
            >
              Ofertas
            </Link>

          </div>
        </div>

        {/* Menú móvil */}

        {showMobileMenu && (
          <div className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-zinc-800 bg-zinc-950 lg:hidden">

            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">

              {/* Categorías */}

              <div ref={categoriesRef}>

                <button
                  onClick={() =>
                    setShowMobileCategories(
                      !showMobileCategories
                    )
                  }
                  className="flex w-full items-center justify-between border-b border-zinc-800 py-4 text-left text-white"
                >
                  <span>
                    Categorías
                  </span>

                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      showMobileCategories
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {showMobileCategories && (
                  <div className="border-b border-zinc-800 py-2">

                    {categories.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-zinc-500">
                        No hay categorías.
                      </div>
                    ) : (
                      categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() =>
                            handleCategorySearch(
                              category
                            )
                          }
                          className="block w-full px-2 py-3 text-left text-sm text-zinc-400 transition hover:text-red-500"
                        >
                          {category.name}
                        </button>
                      ))
                    )}

                  </div>
                )}

              </div>

              {/* Productos */}

              <Link
                to="/products"
                onClick={() =>
                  setShowMobileMenu(false)
                }
                className="block border-b border-zinc-800 py-4 text-zinc-300 transition hover:text-red-500"
              >
                Productos
              </Link>

              {/* Ofertas */}

              <Link
                to="/offers"
                onClick={() =>
                  setShowMobileMenu(false)
                }
                className="block border-b border-zinc-800 py-4 font-semibold text-red-500 transition hover:text-red-400"
              >
                Ofertas
              </Link>

              {/* Favoritos */}

              <Link
                to="/favorites"
                onClick={() =>
                  setShowMobileMenu(false)
                }
                className="flex items-center gap-3 border-b border-zinc-800 py-4 text-zinc-300 transition hover:text-red-500"
              >
                <Heart size={20} />

                Favoritos

                {showFavoriteNotification && (
                  <span className="ml-auto flex h-5 min-w-5 animate-pulse items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                    {favoriteCount}
                  </span>
                )}
              </Link>

              {/* Carrito */}

              <Link
                to="/cart"
                onClick={() =>
                  setShowMobileMenu(false)
                }
                className="flex items-center justify-between border-b border-zinc-800 py-4 text-zinc-300"
              >
                <span className="flex items-center gap-3">
                  <ShoppingCart size={20} />
                  Carrito
                </span>

                {cartCount > 0 && (
                  <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Administrador */}

              {token && isAdmin && (
                <Link
                  to="/admin"
                  onClick={() =>
                    setShowMobileMenu(false)
                  }
                  className="flex items-center gap-3 border-b border-zinc-800 py-4 text-zinc-300 transition hover:text-red-500"
                >
                  <Shield size={20} />
                  Administrador
                </Link>
              )}

              {/* Usuario */}

              {token ? (
                <>
                  <Link
                    to="/orders"
                    onClick={() =>
                      setShowMobileMenu(false)
                    }
                    className="flex items-center gap-3 border-b border-zinc-800 py-4 text-zinc-300 transition hover:text-red-500"
                  >
                    <Package size={20} />
                    Mis Compras
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() =>
                      setShowMobileMenu(false)
                    }
                    className="flex items-center gap-3 border-b border-zinc-800 py-4 text-zinc-300 transition hover:text-red-500"
                  >
                    <User size={20} />
                    {user?.firstName || "Mi cuenta"}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 py-4 text-left text-zinc-300 transition hover:text-red-500"
                  >
                    <LogOut size={20} />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() =>
                    setShowMobileMenu(false)
                  }
                  className="flex items-center gap-3 py-4 text-zinc-300 transition hover:text-red-500"
                >
                  <User size={20} />
                  Iniciar sesión
                </Link>
              )}

            </div>
          </div>
        )}

      </header>
    </>
  );
}

