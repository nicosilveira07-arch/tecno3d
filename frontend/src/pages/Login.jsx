import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login } from "@/services/auth.api";
import { loadUserCart } from "@/features/cart/cart.store";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await login(
        email,
        password
      );

  

      const { token, user } = response.data;

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      loadUserCart();

      if (
        user.role === "ADMIN" ||
        user.role === "EMPLOYEE"
      ) {
        navigate("/admin");
        return;
      }

      navigate("/");
    } catch (error) {
      console.error(
        "ERROR LOGIN:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12">
      <div className="mx-auto max-w-md">

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

          <h1 className="mb-2 text-3xl font-black text-white">
            Iniciar sesión
          </h1>

          <p className="mb-8 text-sm text-zinc-500">
            Ingresá a tu cuenta de TECNO 3D
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="correo@ejemplo.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-600"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
            >
              {loading
                ? "Ingresando..."
                : "Iniciar sesión"}
            </button>

          </form>

          <div className="mt-6 text-center">

            <p className="text-sm text-zinc-500">
              ¿Todavía no tenés una cuenta?
            </p>

            <Link
              to="/register"
              className="mt-2 inline-block font-semibold text-red-500 hover:text-red-400"
            >
              Crear cuenta
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}

