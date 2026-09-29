import {
  Routes,
  Route,
} from "react-router-dom";

import { lazy, Suspense } from "react";

import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AdminRoute from "@/routes/AdminRoute";

const Home = lazy(() => import("@/pages/Home"));
const Products = lazy(() => import("@/pages/Products"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const PaymentFailure = lazy(() => import("@/pages/PaymentFailure"));
const PaymentPending = lazy(() => import("@/pages/PaymentPending"));
const Orders = lazy(() => import("@/pages/Orders"));
const Perfil = lazy(() => import("@/pages/Perfil"));

const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Users = lazy(() => import("@/pages/Users"));
const AdminProducts = lazy(() => import("@/pages/AdminProducts"));
const AdminProductForm = lazy(() => import("@/pages/AdminProductForm"));
const AdminOrders = lazy(() => import("@/pages/AdminOrders"));
const AdminOrderDetail = lazy(() => import("@/pages/AdminOrderDetail"));
const AdminCoupons = lazy(() => import("@/pages/AdminCoupons"));

const Categories = lazy(() => import("@/pages/Categories"));
const AdminBrands = lazy(() => import("@/pages/AdminBrands"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const AdminBanners = lazy(() => import("@/pages/AdminBanners"));
const Offers = lazy(() => import("@/pages/Offers"));
const AdminSettings = lazy(() => import("@/pages/AdminSettings"));

function AdminPlaceholder({ title }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
        Administración
      </p>

      <h1 className="mt-2 text-3xl font-black text-white">
        {title}
      </h1>

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <p className="text-zinc-400">
          Esta sección está preparada para implementar.
        </p>
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-zinc-400">
        Cargando...
      </p>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>

        {/* TIENDA */}

        <Route element={<MainLayout />}>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/offers"
            element={<Offers />}
          />

          <Route
            path="/products/:id"
            element={<ProductDetail />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/profile"
            element={<Perfil />}
          />

          <Route
            path="/favorites"
            element={<Favorites />}
          />

          <Route
            path="/payment/success"
            element={<PaymentSuccess />}
          />

          <Route
            path="/payment/failure"
            element={<PaymentFailure />}
          />

          <Route
            path="/payment/pending"
            element={<PaymentPending />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

        </Route>

        {/* ADMIN */}

        <Route element={<AdminRoute />}>

          <Route element={<AdminLayout />}>

            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/products"
              element={<AdminProducts />}
            />

            <Route
              path="/admin/products/new"
              element={<AdminProductForm />}
            />

            <Route
              path="/admin/products/:id/edit"
              element={<AdminProductForm />}
            />

            <Route
              path="/admin/orders"
              element={<AdminOrders />}
            />

            <Route
              path="/admin/orders/:id"
              element={<AdminOrderDetail />}
            />

            <Route
              path="/admin/users"
              element={<Users />}
            />

            <Route
              path="/admin/categories"
              element={<Categories />}
            />

            {/* CUPONES */}

            <Route
              path="/admin/coupons"
              element={<AdminCoupons />}
            />

            {/* REPORTES */}

            <Route
              path="/admin/reports"
              element={
                <AdminPlaceholder title="Reportes" />
              }
            />

            {/* CONFIGURACIÓN */}

            <Route
              path="/admin/settings"
              element={<AdminSettings />}
            />

            <Route
              path="/admin/brands"
              element={<AdminBrands />}
            />

            <Route
              path="/admin/banners"
              element={<AdminBanners />}
            />

          </Route>

        </Route>

      </Routes>
    </Suspense>
  );
}

