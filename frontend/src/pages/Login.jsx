import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import {
  login,
  loginWithGoogle,
} from "@/services/auth.api";

import { loadUserCart } from "@/features/cart/cart.store";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSuccess = (response) => {
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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await login(
        email,
        password
      );

      handleLoginSuccess(response);
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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      setError("");

      if (!credentialResponse?.credential) {
        throw new Error(
          "Google no proporcionó una credencial válida."
        );
      }

      const response = await loginWithGoogle(
        credentialResponse.credential
      );

      handleLoginSuccess(response);
    } catch (error) {
      console.error(
        "ERROR LOGIN GOOGLE:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "No se pudo iniciar sesión con Google."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError(
      "No se pudo iniciar sesión con Google."
    );
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
              disabled={
                loading ||
                googleLoading
              }
              className="w-full rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
            >
              {loading
                ? "Ingresando..."
                : "Iniciar sesión"}
            </button>

          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />

            <span className="text-xs font-medium text-zinc-500">
              O
            </span>

            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <div className="flex justify-center">
            {googleLoading ? (
              <div className="flex h-10 w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 text-sm text-zinc-400">
                Ingresando con Google...
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="384"
              />
            )}
          </div>

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