import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function OfferBanner() {
  return (
    <section className="bg-gradient-to-r from-red-700 via-red-600 to-red-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 py-16 lg:flex-row">
        <div>
          <p className="text-sm uppercase tracking-widest text-red-100">
            Oferta de lanzamiento
          </p>

          <h2 className="mt-3 text-4xl font-black text-white">
            Hasta 40% OFF
          </h2>

          <p className="mt-3 max-w-xl text-red-100">
            Aprovechá descuentos exclusivos en impresoras 3D,
            notebooks, PCs Gamer y accesorios.
          </p>
        </div>

        <Link
          to="/offers"
          className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-red-600 transition hover:scale-105"
        >
          Comprar ahora

          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}