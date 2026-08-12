import { useEffect, useState } from "react";

import {
  ArrowRight,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { Link } from "react-router-dom";

import { getActiveBanners } from "@/services/banner.api";

const defaultSlides = [
  {
    id: "default-1",
    badge: "TECNO3D STORE",
    title: "Todo lo que",
    highlight: "necesitás en tecnología.",
    description:
      "PCs Gamer, Notebooks, Monitores, Impresoras 3D, Filamentos, Componentes y mucho más.",
    primaryText: "Comprar",
    primaryLink: "/products",
    secondaryText: "Catálogo",
    secondaryLink: "/products",
    image: "/hero.png",
    type: "default",
  },
];

export default function Hero() {
  const [slides, setSlides] = useState(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const response = await getActiveBanners();


        const banners = response?.data || [];

        if (banners.length > 0) {
          const formattedBanners = banners.map((banner) => ({
            id: banner.id,
            badge: "OFERTA ESPECIAL",
            title: banner.title,
            highlight: "",
            description: banner.description || "",
            primaryText: banner.buttonText || "Comprar ahora",
            primaryLink: banner.link || "/offers",
            secondaryText: "Ver catálogo",
            secondaryLink: "/products",
            image: banner.image,
            type: "offer",
          }));

          setSlides(formattedBanners);
        }
      } catch (error) {
        console.error("ERROR CARGANDO BANNERS:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentSlide((current) =>
        current === slides.length - 1 ? 0 : current + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  const handlePrevious = () => {
    setCurrentSlide((current) =>
      current === 0 ? slides.length - 1 : current - 1
    );
  };

  const handleNext = () => {
    setCurrentSlide((current) =>
      current === slides.length - 1 ? 0 : current + 1
    );
  };

  if (loading) {
    return (
      <section className="relative overflow-hidden">
        <div className="mx-auto flex min-h-[85vh] max-w-7xl items-center justify-center px-6">
          <div className="text-sm text-zinc-500">
            Cargando...
          </div>
        </div>
      </section>
    );
  }

  const slide = slides[currentSlide];

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto min-h-[85vh] max-w-7xl px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="grid min-h-[85vh] items-center gap-16 lg:grid-cols-2"
          >
            {/* TEXTO */}

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="relative z-10"
            >
              {/* BADGE */}

              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  slide.type === "offer"
                    ? "bg-red-600 text-white"
                    : "bg-red-600/10 text-red-500"
                }`}
              >
                {slide.type === "offer" && <Tag size={15} />}

                {slide.badge}
              </span>

              {/* TÍTULO */}

              <h1 className="mt-8 text-5xl font-black leading-tight text-white lg:text-7xl">
                {slide.title}

                {slide.highlight && (
                  <span className="block text-red-600">
                    {slide.highlight}
                  </span>
                )}
              </h1>

              {/* DESCRIPCIÓN */}

              {slide.description && (
                <p className="mt-8 max-w-xl text-lg leading-8 text-zinc-400">
                  {slide.description}
                </p>
              )}

              {/* BOTONES */}

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to={slide.primaryLink}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-8 py-4 font-semibold text-white transition hover:bg-red-700"
                >
                  {slide.primaryText}

                  <ArrowRight size={18} />
                </Link>

                <Link
                  to={slide.secondaryLink}
                  className="flex items-center gap-2 rounded-xl border border-zinc-700 px-8 py-4 text-white transition hover:border-red-600 hover:text-red-500"
                >
                  <ShoppingBag size={18} />

                  {slide.secondaryText}
                </Link>
              </div>
            </motion.div>

            {/* IMAGEN */}

            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center"
            >
              <div className="absolute h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />

              <img
                src={slide.image}
                alt={slide.title}
                className="relative z-10 w-full max-w-xl drop-shadow-[0_20px_80px_rgba(220,38,38,.35)]"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* FLECHA ANTERIOR */}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Slide anterior"
              className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-800 bg-black/50 text-white backdrop-blur-sm transition hover:border-red-600 hover:bg-red-600"
            >
              <ChevronLeft size={22} />
            </button>

            {/* FLECHA SIGUIENTE */}

            <button
              type="button"
              onClick={handleNext}
              aria-label="Slide siguiente"
              className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-800 bg-black/50 text-white backdrop-blur-sm transition hover:border-red-600 hover:bg-red-600"
            >
              <ChevronRight size={22} />
            </button>

            {/* INDICADORES */}

            <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              {slides.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Ir al slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "w-8 bg-red-600"
                      : "w-2 bg-zinc-700 hover:bg-zinc-500"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}