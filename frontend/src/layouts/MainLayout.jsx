import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import FirstPurchaseFloat from "@/components/promo/FirstPurchaseFloat";
import WelcomeCouponModal from "@/components/promo/WelcomeCouponModal";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <FirstPurchaseFloat />
      <WelcomeCouponModal />
      <WhatsAppFloat />

      <main>
        <Outlet />
      </main>
    </>
  );
}