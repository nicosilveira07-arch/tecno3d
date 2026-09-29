import { lazy, Suspense, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import App from "./App";
import "./index.css";

const GoogleOAuthProvider = lazy(() =>
  import("@react-oauth/google").then(
    ({ GoogleOAuthProvider }) => ({
      default: GoogleOAuthProvider,
    })
  )
);

const queryClient = new QueryClient();

function AppWithGoogleAuth() {
  const location = useLocation();

  const isGoogleAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  if (isGoogleAuthPage) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-zinc-400">
              Cargando...
            </p>
          </div>
        }
      >
        <GoogleOAuthProvider
          clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
        >
          <App />
        </GoogleOAuthProvider>
      </Suspense>
    );
  }

  return <App />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppWithGoogleAuth />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);