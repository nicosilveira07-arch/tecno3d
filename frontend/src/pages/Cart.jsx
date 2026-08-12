import {
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  useCart,
  addToCart,
  decreaseQuantity,
  removeFromCart,
} from "@/features/cart/cart.store";

export default function Cart() {
  const cart = useCart();
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) =>
      sum + item.quantity,
    0
  );

  return (
    <section className="bg-zinc-950 px-6 py-12">
      <div className="mx-auto max-w-7xl">

        <h1 className="mb-10 text-4xl font-black text-white">
          Carrito
        </h1>

        {cart.length === 0 ? (

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">

            <p className="text-lg text-zinc-400">
              El carrito está vacío.
            </p>

          </div>

        ) : (

          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">

            {/* Productos */}

            <div className="space-y-4">

              {cart.map((item) => (

                <div
                  key={item.productId}
                  className="flex flex-col gap-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:flex-row sm:items-center sm:justify-between"
                >

                  {/* Producto */}

                  <div className="flex items-center gap-5">

                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-zinc-800">

                      {item.image ? (

                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        <span className="text-xs text-zinc-500">
                          Sin imagen
                        </span>

                      )}

                    </div>

                    <div>

                      <h2 className="font-bold text-white">
                        {item.name}
                      </h2>

                      <p className="mt-1 text-zinc-400">
                        UYU {item.price}
                      </p>

                    </div>

                  </div>


                  {/* Controles */}

                  <div className="flex items-center gap-4">

                    <button
                      onClick={() =>
                        decreaseQuantity(
                          item.productId
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-white transition hover:bg-zinc-700"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="w-6 text-center font-bold text-white">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        addToCart(item)
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-white transition hover:bg-zinc-700"
                    >
                      <Plus size={16} />
                    </button>

                    <button
                      onClick={() =>
                        removeFromCart(
                          item.productId
                        )
                      }
                      className="ml-3 flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>


                  {/* Subtotal */}

                  <p className="text-xl font-bold text-red-500">
                    UYU{" "}
                    {(item.price * item.quantity).toFixed(2)}
                  </p>

                </div>

              ))}

            </div>


            {/* Resumen */}

            <div className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

              <h2 className="mb-6 text-2xl font-bold text-white">
                Resumen
              </h2>

              <div className="flex justify-between border-b border-zinc-800 pb-4">

                <span className="text-zinc-400">
                  Productos
                </span>

                <span className="font-semibold text-white">
                  {totalItems}
                </span>

              </div>


              <div className="mt-4 flex justify-between">

                <span className="text-lg text-zinc-400">
                  Total
                </span>

                <span className="text-2xl font-black text-red-500">
                  UYU {total.toFixed(2)}
                </span>

              </div>


              <button
                onClick={() => navigate("/checkout")}
                className="mt-6 w-full rounded-xl bg-red-600 py-4 font-bold text-white transition hover:bg-red-700"
              >
                Ir al checkout
              </button>

            </div>

          </div>

        )}

      </div>
    </section>
  );
}
