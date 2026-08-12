import api from "./api";

// LOGIN
export async function login(email, password) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
}

// REGISTRO
export async function register(data) {
  const response = await api.post("/auth/register", data);

  return response.data;
}

// USUARIO AUTENTICADO
export async function getMe() {
  const response = await api.get("/auth/me");

  return response.data;
}

// CAMBIAR CONTRASEÑA
export async function changePassword(data) {
  const response = await api.patch(
    "/auth/change-password",
    data
  );

  return response.data;
}

