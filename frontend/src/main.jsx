import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

function AppWithGoogleAuth() {
  const location = useLocation();

  const isGoogleAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  if (isGoogleAuthPage) {
    return (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
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

