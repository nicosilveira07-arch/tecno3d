import {
  findCartForCheckout,
  findAddressById,
  createOrder,
  createOrderItems,
  decreaseProductStock,
  clearUserCart,
} from "../repositories/checkout.repository.js";


export async function getCheckoutService(userId, addressId) {
  const cart = await findCartForCheckout(userId);

  if (!cart) {
    throw new Error("Carrito no encontrado.");
  }

  if (cart.items.length === 0) {
    throw new Error("El carrito está vacío.");
  }

  const address = await findAddressById(
    addressId,
    userId
  );

  if (!address) {
    throw new Error("Dirección no encontrada.");
  }

  let subtotal = 0;

  const items = cart.items.map((item) => {
    const total = item.quantity * item.product.price;

    subtotal += total;

    return {
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      total,
    };
  });

  return {
    address,
    items,
    subtotal,
    shipping: 0,
    total: subtotal,
  };
}


export async function confirmCheckoutService(
  userId,
  addressId
) {
  const cart = await findCartForCheckout(userId);

  if (!cart) {
    throw new Error("Carrito no encontrado.");
  }

  if (cart.items.length === 0) {
    throw new Error("El carrito está vacío.");
  }

  const address = await findAddressById(
    addressId,
    userId
  );

  if (!address) {
    throw new Error("Dirección no encontrada.");
  }


  let total = 0;

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new Error(
        `Stock insuficiente para ${item.product.name}.`
      );
    }

    total += item.product.price * item.quantity;
  }


  const order = await createOrder({
    userId,
    total,
    status: "PENDING",
  });


  const orderItems = cart.items.map((item) => ({
    orderId: order.id,
    productId: item.product.id,
    quantity: item.quantity,
    price: item.product.price,
  }));


  await createOrderItems(orderItems);


  for (const item of cart.items) {
    await decreaseProductStock(
      item.product.id,
      item.quantity
    );
  }


  await clearUserCart(cart.id);


  return order;
}