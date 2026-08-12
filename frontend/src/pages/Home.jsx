import Hero from "@/components/ecommerce/Hero";
import Categories from "@/components/ecommerce/Categories";
import FeaturedProducts from "@/components/ecommerce/FeaturedProducts";
import OfferBanner from "@/components/ecommerce/OfferBanner";
import Brands from "@/components/ecommerce/Brands";
import Footer from "@/components/ecommerce/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <OfferBanner />
      <Brands />
      <Footer />
    </>
  );
}