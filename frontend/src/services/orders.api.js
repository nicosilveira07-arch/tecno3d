import api from "./api";

export async function createOrder(data) {
const response = await api.post(
"/orders",
data
);

return response.data;
}

export async function createOrderPayment(
checkoutSessionId
) {
const response = await api.post(
`/mercadopago/order/${checkoutSessionId}`
);

return response.data;
}

export async function cancelPendingOrder(
orderId
) {
const response = await api.patch(
`/orders/pending/${orderId}/cancel`
);

return response.data;
}
