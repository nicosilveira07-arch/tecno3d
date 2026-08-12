import api from "./api";

export async function createOrder(data) {
  const response = await api.post(
    "/orders",
    data
  );

  return response.data;
}

export async function createOrderPayment(orderId) {
  const response = await api.post(
    `/mercadopago/order/${orderId}`
  );

  return response.data;
}

