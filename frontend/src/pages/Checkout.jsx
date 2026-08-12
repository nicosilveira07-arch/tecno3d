import { useEffect, useState } from "react";
import { MapPin, Plus, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useCart } from "@/features/cart/cart.store";

import {
  getAddresses,
  createAddress,
} from "@/services/addresses.api";

import {
  createOrder,
  createOrderPayment,
} from "@/services/orders.api";

export default function Checkout() {
  const navigate = useNavigate();

  const cart = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [deliveryMethod, setDeliveryMethod] =
    useState("address");

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [loadingAddresses, setLoadingAddresses] =
    useState(true);

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [addressForm, setAddressForm] = useState({
    title: "",
    street: "",
    number: "",
    city: "",
    state: "",
    country: "Uruguay",
    zipCode: "",
    isDefault: false,
  });

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    const loadAddresses = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoadingAddresses(false);
        return;
      }

      try {
        const response = await getAddresses();

        const data = response.data || [];

        setAddresses(data);

        const defaultAddress = data.find(
          (address) => address.isDefault
        );

        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id);
        } else if (data.length > 0) {
          setSelectedAddress(data[0].id);
        }
      } catch (error) {
        console.error(
          "ERROR CARGANDO DIRECCIONES:",
          error
        );

        setError(
          error.response?.data?.message ||
            "No se pudieron cargar las direcciones."
        );
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, []);

  if (cart.length === 0) {
    return (
      <section className="min-h-screen bg-zinc-950 px-6 py-10">
        <div className="mx-auto max-w-7xl">

          <h1 className="mb-8 text-4xl font-black text-white">
            Checkout
          </h1>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-zinc-400">
              No hay productos en el carrito.
            </p>
          </div>

        </div>
      </section>
    );
  }

  const handleAddressChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setAddressForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleCreateAddress = async (event) => {
    event.preventDefault();

    try {
      setSavingAddress(true);
      setError("");

      const response =
        await createAddress(addressForm);

      const newAddress = response.data;

      setAddresses((previous) => [
        newAddress,
        ...previous,
      ]);

      setSelectedAddress(newAddress.id);
      setDeliveryMethod("address");

      setShowAddressForm(false);

      setAddressForm({
        title: "",
        street: "",
        number: "",
        city: "",
        state: "",
        country: "Uruguay",
        zipCode: "",
        isDefault: false,
      });
    } catch (error) {
      console.error(
        "ERROR CREANDO DIRECCIÓN:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudo guardar la dirección."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleCheckout = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (
      deliveryMethod === "address" &&
      !selectedAddress
    ) {
      setError(
        "Seleccioná una dirección de entrega."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const orderResponse =
        await createOrder({
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),

          deliveryMethod:
            deliveryMethod === "pickup"
              ? "PICKUP"
              : "SHIPPING",

          addressId:
            deliveryMethod === "pickup"
              ? null
              : selectedAddress,
        });

      const orderId =
        orderResponse.data.id;

      console.log(
        "PEDIDO CREADO:",
        orderResponse.data
      );

      const paymentResponse =
        await createOrderPayment(orderId);

      console.log(
        "PAGO MERCADO PAGO:",
        paymentResponse.data
      );

      const initPoint =
        paymentResponse.data.initPoint;

      if (!initPoint) {
        throw new Error(
          "Mercado Pago no devolvió la URL de pago."
        );
      }

      window.location.href =
        initPoint;
    } catch (error) {
      console.error(
        "ERROR EN CHECKOUT:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "No se pudo iniciar el pago."
      );

      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-zinc-950 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        <h1 className="mb-10 text-4xl font-black text-white">
          Checkout
        </h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ENTREGA */}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">
                Datos de entrega
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Elegí cómo querés recibir tu pedido.
              </p>
            </div>

            {/* MÉTODO DE ENTREGA */}

            <div className="grid gap-4 md:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  setDeliveryMethod("address")
                }
                className={`rounded-xl border p-5 text-left transition ${
                  deliveryMethod === "address"
                    ? "border-red-600 bg-red-950/20"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                }`}
              >
                <MapPin
                  size={24}
                  className="mb-3 text-red-500"
                />

                <p className="font-bold text-white">
                  Envío a domicilio
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Recibí tu pedido en una dirección guardada.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setDeliveryMethod("pickup")
                }
                className={`rounded-xl border p-5 text-left transition ${
                  deliveryMethod === "pickup"
                    ? "border-red-600 bg-red-950/20"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                }`}
              >
                <Store
                  size={24}
                  className="mb-3 text-red-500"
                />

                <p className="font-bold text-white">
                  Retirar en el local
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Retirá tu compra directamente en nuestro local.
                </p>
              </button>

            </div>

            {/* DIRECCIONES */}

            {deliveryMethod === "address" && (
              <div className="mt-8">

                <div className="mb-5 flex items-center justify-between">

                  <h3 className="text-lg font-bold text-white">
                    Mis direcciones
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      setShowAddressForm(
                        (previous) => !previous
                      )
                    }
                    className="flex items-center gap-2 rounded-xl border border-red-600 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-600 hover:text-white"
                  >
                    <Plus size={17} />
                    Agregar nueva dirección
                  </button>

                </div>

                {/* FORMULARIO */}

                {showAddressForm && (
                  <form
                    onSubmit={
                      handleCreateAddress
                    }
                    className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 p-6"
                  >

                    <h3 className="mb-5 text-lg font-bold text-white">
                      Nueva dirección
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">

                      <input
                        name="title"
                        value={addressForm.title}
                        onChange={
                          handleAddressChange
                        }
                        placeholder="Título. Ej: Casa"
                        required
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-600"
                      />

                      <input
                        name="street"
                        value={
                          addressForm.street
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="Calle"
                        required
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-600"
                      />

                      <input
                        name="number"
                        value={
                          addressForm.number
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="Número"
                        required
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-600"
                      />

                      <input
                        name="city"
                        value={
                          addressForm.city
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="Ciudad"
                        required
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-600"
                      />

                      <input
                        name="state"
                        value={
                          addressForm.state
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="Departamento"
                        required
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-600"
                      />

                      <input
                        name="country"
                        value={
                          addressForm.country
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="País"
                        required
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-600"
                      />

                      <input
                        name="zipCode"
                        value={
                          addressForm.zipCode
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="Código postal"
                        required
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-600"
                      />

                      <label className="flex items-center gap-3 text-sm text-zinc-400">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={
                            addressForm.isDefault
                          }
                          onChange={
                            handleAddressChange
                          }
                          className="h-4 w-4 accent-red-600"
                        />

                        Usar como dirección principal
                      </label>

                    </div>

                    <div className="mt-5 flex gap-3">

                      <button
                        type="submit"
                        disabled={
                          savingAddress
                        }
                        className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:bg-zinc-700"
                      >
                        {savingAddress
                          ? "Guardando..."
                          : "Guardar dirección"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowAddressForm(false)
                        }
                        className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800"
                      >
                        Cancelar
                      </button>

                    </div>

                  </form>
                )}

                {/* LISTADO */}

                {loadingAddresses ? (
                  <p className="text-zinc-500">
                    Cargando direcciones...
                  </p>
                ) : addresses.length === 0 ? (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

                    <p className="text-zinc-400">
                      Todavía no tenés ninguna dirección guardada.
                    </p>

                    <p className="mt-2 text-sm text-zinc-600">
                      Podés agregar una nueva dirección desde el botón de arriba.
                    </p>

                  </div>
                ) : (
                  <div className="space-y-4">

                    {addresses.map(
                      (address) => (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() =>
                            setSelectedAddress(
                              address.id
                            )
                          }
                          className={`w-full rounded-xl border p-5 text-left transition ${
                            selectedAddress ===
                            address.id
                              ? "border-red-600 bg-red-950/20"
                              : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                          }`}
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div>

                              <p className="font-bold text-white">
                                {address.title}
                              </p>

                              <p className="mt-2 text-sm text-zinc-400">
                                {address.street}{" "}
                                {address.number}
                              </p>

                              <p className="text-sm text-zinc-500">
                                {address.city},{" "}
                                {address.state}
                              </p>

                              <p className="text-sm text-zinc-500">
                                {address.country} ·{" "}
                                {address.zipCode}
                              </p>

                            </div>

                            {address.isDefault && (
                              <span className="rounded-full bg-red-600/10 px-3 py-1 text-xs font-semibold text-red-500">
                                Principal
                              </span>
                            )}

                          </div>

                        </button>
                      )
                    )}

                  </div>
                )}

              </div>
            )}

            {/* RETIRO EN LOCAL */}

            {deliveryMethod === "pickup" && (
              <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950 p-6">

                <div className="flex items-start gap-4">

                  <div className="rounded-xl bg-red-600/10 p-3">
                    <Store
                      size={24}
                      className="text-red-500"
                    />
                  </div>

                  <div>

                    <h3 className="font-bold text-white">
                      Retiro en nuestro local
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      Podés retirar tu compra personalmente
                      en el local de TECNO 3D.
                    </p>

                    <p className="mt-3 text-sm text-zinc-500">
                      Te informaremos cuando tu pedido
                      esté listo para retirar.
                    </p>

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* RESUMEN */}

          <div className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

            <h2 className="mb-6 text-2xl font-bold text-white">
              Resumen del pedido
            </h2>

            {/* MÉTODO DE ENTREGA */}

            <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">

              <p className="text-sm text-zinc-500">
                Método de entrega
              </p>

              <div className="mt-2 flex items-center gap-3">

                {deliveryMethod === "pickup" ? (
                  <>
                    <Store
                      size={20}
                      className="text-red-500"
                    />

                    <div>
                      <p className="font-bold text-white">
                        Retiro en el local
                      </p>

                      <p className="text-xs text-zinc-500">
                        Retirás tu pedido personalmente.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <MapPin
                      size={20}
                      className="text-red-500"
                    />

                    <div>
                      <p className="font-bold text-white">
                        Envío a domicilio
                      </p>

                      <p className="text-xs text-zinc-500">
                        {selectedAddress
                          ? addresses.find(
                              (address) =>
                                address.id ===
                                selectedAddress
                            )?.title ||
                            "Dirección seleccionada"
                          : "Seleccioná una dirección"}
                      </p>
                    </div>
                  </>
                )}

              </div>

            </div>

            {/* PRODUCTOS */}

            <div className="space-y-4">

              {cart.map((item) => (

                <div
                  key={item.productId}
                  className="flex justify-between gap-4 border-b border-zinc-800 pb-4"
                >

                  <div>

                    <p className="font-semibold text-white">
                      {item.name}
                    </p>

                    <p className="text-sm text-zinc-500">
                      Cantidad: {item.quantity}
                    </p>

                  </div>

                  <p className="font-semibold text-white">
                    UYU{" "}
                    {(
                      item.price *
                      item.quantity
                    ).toFixed(2)}
                  </p>

                </div>

              ))}

            </div>

            {/* TOTAL */}

            <div className="mt-6 flex justify-between">

              <span className="text-lg text-zinc-400">
                Total
              </span>

              <span className="text-2xl font-black text-red-500">
                UYU {total.toFixed(2)}
              </span>

            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={
                loading ||
                loadingAddresses ||
                savingAddress
              }
              className="mt-8 w-full rounded-xl bg-red-600 py-4 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
            >
              {loading
                ? "Procesando..."
                : "Continuar con el pago"}
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}

