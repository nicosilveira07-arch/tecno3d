import { useEffect, useState } from "react";
import { MapPin, Plus, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  useCart,
  clearCart,
} from "@/features/cart/cart.store";

import {
  getAddresses,
  createAddress,
} from "@/services/addresses.api";

import { validateCoupon } from "@/services/coupons.api";

import {
  createCheckoutSession,
} from "@/services/checkoutSession.api";

import {
  createOrderPayment,
} from "@/services/orders.api";

const PHONE_COUNTRIES = [
  {  code: "+598", iso: "UY" },
  {  code: "+54", iso: "AR" },
  {  code: "+55", iso: "BR" },
  {  code: "+595", iso: "PY" },
  {  code: "+56", iso: "CL" },
  {  code: "+591", iso: "BO" },
  {  code: "+51", iso: "PE" },
  {  code: "+57", iso: "CO" },
  {  code: "+593", iso: "EC" },
];

export default function Checkout() {
  const navigate = useNavigate();

  const cart = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] =
    useState(null);

  const [deliveryMethod, setDeliveryMethod] =
    useState("address");

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [loadingAddresses, setLoadingAddresses] =
    useState(true);

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [couponCode, setCouponCode] =
    useState("");

  const [coupon, setCoupon] =
    useState(null);

  const [couponLoading, setCouponLoading] =
    useState(false);

  const [couponError, setCouponError] =
    useState("");

  const [addressForm, setAddressForm] = useState({
    title: "",
    street: "",
    number: "",
    city: "",
    state: "",
    country: "Uruguay",
    zipCode: "",
    phoneCountry: "+598",
    phoneNumber: "",
    isDefault: false,
  });

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const discount = coupon
    ? coupon.type === "PERCENTAGE"
      ? subtotal * (coupon.value / 100)
      : coupon.value
    : 0;

  const finalTotal = Math.max(
    subtotal - discount,
    0
  );

  useEffect(() => {
    const loadAddresses = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setLoadingAddresses(false);
        return;
      }

      try {
        const response =
          await getAddresses();

        const data =
          response.data || [];

        setAddresses(data);

        const defaultAddress =
          data.find(
            (address) =>
              address.isDefault
          );

        if (defaultAddress) {
          setSelectedAddress(
            defaultAddress.id
          );
        } else if (
          data.length > 0
        ) {
          setSelectedAddress(
            data[0].id
          );
        }
      } catch (error) {
        console.error(
          "ERROR CARGANDO DIRECCIONES:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
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
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setAddressForm(
      (previous) => ({
        ...previous,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  };

  const handleCreateAddress = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSavingAddress(true);
      setError("");

      const phone =
        `${addressForm.phoneCountry} ${addressForm.phoneNumber.trim()}`.trim();

      const response =
        await createAddress({
          title:
            addressForm.title,

          street:
            addressForm.street,

          number:
            addressForm.number,

          city:
            addressForm.city,

          state:
            addressForm.state,

          country:
            addressForm.country,

          zipCode:
            addressForm.zipCode,

          phone,

          isDefault:
            addressForm.isDefault,
        });

      const newAddress =
        response.data;

      setAddresses(
        (previous) => [
          newAddress,
          ...previous,
        ]
      );

      setSelectedAddress(
        newAddress.id
      );

      setDeliveryMethod(
        "address"
      );

      setShowAddressForm(
        false
      );

      setAddressForm({
        title: "",
        street: "",
        number: "",
        city: "",
        state: "",
        country: "Uruguay",
        zipCode: "",
        phoneCountry: "+598",
        phoneNumber: "",
        isDefault: false,
      });
    } catch (error) {
      console.error(
        "ERROR CREANDO DIRECCIÓN:",
        error
      );

      setError(
        error.response?.data
          ?.message ||
          "No se pudo guardar la dirección."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleApplyCoupon =
    async () => {
      if (!couponCode.trim()) {
        setCouponError(
          "Ingresá un código de cupón."
        );

        return;
      }

      try {
        setCouponLoading(true);
        setCouponError("");

        const response =
          await validateCoupon(
            couponCode
              .trim()
              .toUpperCase()
          );

        setCoupon(
          response.data
        );
      } catch (error) {
        console.error(
          "ERROR VALIDANDO CUPÓN:",
          error
        );

        setCoupon(null);

        setCouponError(
          error.response?.data
            ?.message ||
            "El cupón no es válido."
        );
      } finally {
        setCouponLoading(false);
      }
    };

  const handleRemoveCoupon =
    () => {
      setCoupon(null);
      setCouponCode("");
      setCouponError("");
    };

  const handleCheckout =
    async () => {
      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        navigate("/login");
        return;
      }

      if (
        deliveryMethod ===
          "address" &&
        !selectedAddress
      ) {
        setError(
          "Seleccioná una dirección de entrega."
        );

        return;
      }

      if (
        deliveryMethod ===
        "address"
      ) {
        const selectedAddressData =
          addresses.find(
            (address) =>
              address.id ===
              selectedAddress
          );

        if (
          !selectedAddressData?.phone?.trim()
        ) {
          setError(
            "La dirección seleccionada no tiene un teléfono de contacto. Actualizá la dirección antes de continuar con el envío."
          );

          return;
        }
      }

      try {
        setLoading(true);
        setError("");

        const expiresAt =
          new Date(
            Date.now() +
              30 *
                60 *
                1000
          ).toISOString();

        const sessionResponse =
          await createCheckoutSession(
            {
              total:
                finalTotal,

              discount,

              couponId:
                coupon?.id ||
                null,

              deliveryMethod:
                deliveryMethod ===
                "pickup"
                  ? "PICKUP"
                  : "SHIPPING",

              addressId:
                deliveryMethod ===
                "pickup"
                  ? null
                  : selectedAddress,

              expiresAt,

              items: cart.map(
                (item) => ({
                  productId:
                    item.productId,

                  quantity:
                    item.quantity,

                  price:
                    Number(
                      item.price
                    ),

                  productName:
                    item.name,
                })
              ),
            }
          );

        const session =
          sessionResponse.data;

        if (!session?.id) {
          throw new Error(
            "No se pudo crear la sesión de checkout."
          );
        }

        console.log(
          "CHECKOUT SESSION CREADA:",
          session
        );

        const paymentResponse =
          await createOrderPayment(
            session.id
          );

        console.log(
          "PAGO MERCADO PAGO:",
          paymentResponse.data
        );

        const initPoint =
          paymentResponse
            .data?.initPoint;

        if (!initPoint) {
          throw new Error(
            "Mercado Pago no devolvió la URL de pago."
          );
        }

        clearCart();

        window.location.href =
          initPoint;
      } catch (error) {
        console.error(
          "ERROR EN CHECKOUT:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            error.message ||
            "No se pudo iniciar el checkout."
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

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

            <div className="mb-8">

              <h2 className="text-2xl font-bold text-white">
                Datos de entrega
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Elegí cómo querés recibir tu pedido.
              </p>

            </div>

            <div className="grid gap-4 md:grid-cols-2">

              <button
                type="button"
                onClick={() => {
                  setDeliveryMethod(
                    "address"
                  );
                  setError("");
                }}
                className={`rounded-xl border p-5 text-left transition ${
                  deliveryMethod ===
                  "address"
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
                onClick={() => {
                  setDeliveryMethod(
                    "pickup"
                  );
                  setError("");
                }}
                className={`rounded-xl border p-5 text-left transition ${
                  deliveryMethod ===
                  "pickup"
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

            {deliveryMethod ===
              "address" && (
              <div className="mt-8">

                <div className="mb-5 flex items-center justify-between">

                  <h3 className="text-lg font-bold text-white">
                    Mis direcciones
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      setShowAddressForm(
                        (previous) =>
                          !previous
                      )
                    }
                    className="flex items-center gap-2 rounded-xl border border-red-600 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-600 hover:text-white"
                  >
                    <Plus size={17} />

                    Agregar nueva dirección
                  </button>

                </div>

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
                        value={
                          addressForm.title
                        }
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

                      <div className="md:col-span-2">

                        <label className="mb-2 block text-sm font-semibold text-white">
                          Código postal y teléfono de contacto
                        </label>

                        <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr_1fr]">

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
                            inputMode="numeric"
                            autoComplete="postal-code"
                            className="min-w-0 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-600"
                          />

                          <select
                            name="phoneCountry"
                            value={
                              addressForm.phoneCountry
                            }
                            onChange={
                              handleAddressChange
                            }
                            required
                            className="min-w-0 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-600"
                          >
                            {PHONE_COUNTRIES.map(
                              (country) => (
                                <option
                                  key={`${country.iso}-${country.code}`}
                                  value={
                                    country.code
                                  }
                                  className="bg-zinc-900 text-white"
                                >
                                  {country.iso}{" "}
                                  {country.name}{" "}
                                  {country.code}
                                </option>
                              )
                            )}
                          </select>

                          <input
                            name="phoneNumber"
                            type="tel"
                            value={
                              addressForm.phoneNumber
                            }
                            onChange={
                              handleAddressChange
                            }
                            placeholder="Número de Contacto"
                            required
                            autoComplete="tel-national"
                            inputMode="numeric"
                            className="min-w-0 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-600"
                          />

                        </div>

                        <p className="mt-2 text-xs text-zinc-600">
                          Ingresá solamente el número de teléfono, sin el código de país.
                        </p>

                      </div>

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
                          setShowAddressForm(
                            false
                          )
                        }
                        className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800"
                      >
                        Cancelar
                      </button>

                    </div>

                  </form>
                )}

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
                          key={
                            address.id
                          }
                          type="button"
                          onClick={() => {
                            setSelectedAddress(
                              address.id
                            );
                            setError("");
                          }}
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
                                {
                                  address.title
                                }
                              </p>

                              <p className="mt-2 text-sm text-zinc-400">
                                {
                                  address.street
                                }{" "}
                                {
                                  address.number
                                }
                              </p>

                              <p className="text-sm text-zinc-500">
                                {
                                  address.city
                                }
                                ,{" "}
                                {
                                  address.state
                                }
                              </p>

                              <p className="text-sm text-zinc-500">
                                {
                                  address.country
                                }{" "}
                                ·{" "}
                                {
                                  address.zipCode
                                }
                              </p>

                              <p className="mt-2 text-sm text-zinc-400">
                                Teléfono:{" "}
                                {address.phone
                                  ? address.phone
                                  : "No registrado"}
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

            {deliveryMethod ===
              "pickup" && (
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
                      Magallanes 3140, SALTO, Uruguay
                    </p>

                  </div>

                </div>

              </div>
            )}

          </div>

          <div className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

            <h2 className="mb-6 text-2xl font-bold text-white">
              Resumen del pedido
            </h2>

            <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">

              <p className="text-sm text-zinc-500">
                Método de entrega
              </p>

              <div className="mt-2 flex items-center gap-3">

                {deliveryMethod ===
                "pickup" ? (
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

            <div className="space-y-4">

              {cart.map(
                (item) => (

                  <div
                    key={
                      item.productId
                    }
                    className="flex justify-between gap-4 border-b border-zinc-800 pb-4"
                  >

                    <div>

                      <p className="font-semibold text-white">
                        {item.name}
                      </p>

                      <p className="text-sm text-zinc-500">
                        Cantidad:{" "}
                        {item.quantity}
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

                )
              )}

            </div>

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">

              <p className="mb-3 text-sm font-semibold text-white">
                Cupón de descuento
              </p>

              {!coupon ? (
                <div className="flex gap-2">

                  <input
                    type="text"
                    value={
                      couponCode
                    }
                    onChange={(
                      event
                    ) => {
                      setCouponCode(
                        event.target
                          .value
                      );

                      setCouponError(
                        ""
                      );
                    }}
                    placeholder="Ingresá tu cupón"
                    className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white uppercase outline-none focus:border-red-600"
                  />

                  <button
                    type="button"
                    onClick={
                      handleApplyCoupon
                    }
                    disabled={
                      couponLoading
                    }
                    className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:bg-zinc-700"
                  >
                    {couponLoading
                      ? "..."
                      : "Agregar"}
                  </button>

                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-green-800 bg-green-950/30 p-3">

                  <div>

                    <p className="font-bold text-green-400">
                      {
                        coupon.code
                      }
                    </p>

                    <p className="text-xs text-green-500">
                      {coupon.type ===
                      "PERCENTAGE"
                        ? `${coupon.value}% de descuento`
                        : `UYU ${coupon.value.toFixed(
                            2
                          )} de descuento`}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleRemoveCoupon
                    }
                    className="text-xs font-semibold text-zinc-400 transition hover:text-white"
                  >
                    Quitar
                  </button>

                </div>
              )}

              {couponError && (
                <p className="mt-3 text-sm text-red-400">
                  {couponError}
                </p>
              )}

            </div>

            <div className="mt-6 space-y-3">

              <div className="flex justify-between">

                <span className="text-zinc-400">
                  Subtotal
                </span>

                <span className="font-semibold text-white">
                  UYU{" "}
                  {subtotal.toFixed(2)}
                </span>

              </div>

              {coupon && (
                <div className="flex justify-between">

                  <span className="text-zinc-400">
                    Descuento
                  </span>

                  <span className="font-semibold text-green-500">
                    - UYU{" "}
                    {discount.toFixed(2)}
                  </span>

                </div>
              )}

              <div className="flex justify-between border-t border-zinc-800 pt-4">

                <span className="text-lg text-zinc-400">
                  Total
                </span>

                <span className="text-2xl font-black text-red-500">
                  UYU{" "}
                  {finalTotal.toFixed(2)}
                </span>

              </div>

            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={
                handleCheckout
              }
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

