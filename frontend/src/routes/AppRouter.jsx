import {
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AdminRoute from "@/routes/AdminRoute";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentFailure from "@/pages/PaymentFailure";
import PaymentPending from "@/pages/PaymentPending";
import Orders from "@/pages/Orders";
import Perfil from "@/pages/Perfil";

import AdminDashboard from "@/pages/AdminDashboard";
import Users from "@/pages/Users";
import AdminProducts from "@/pages/AdminProducts";
import AdminProductForm from "@/pages/AdminProductForm";
import AdminOrders from "@/pages/AdminOrders";
import AdminOrderDetail from "@/pages/AdminOrderDetail";
import AdminCoupons from "@/pages/AdminCoupons";

import Categories from "@/pages/Categories";
import AdminBrands from "@/pages/AdminBrands";
import Favorites from "@/pages/Favorites";
import AdminBanners from "@/pages/AdminBanners";
import Offers from "@/pages/Offers";
import AdminSettings from "@/pages/AdminSettings";

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

export default function AppRouter() {
  return (
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
            element={
              <AdminSettings />
            }
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
  );
}