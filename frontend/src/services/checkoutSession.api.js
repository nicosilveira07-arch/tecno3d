import api from "./api";

export async function createCheckoutSession(
data
) {
const response = await api.post(
"/checkout-sessions",
data
);

return response.data;
}

export async function getCheckoutSession(
sessionId
) {
const response = await api.get(
`/checkout-sessions/${sessionId}`
);

return response.data;
}

export async function updateCheckoutSession(
sessionId,
data
) {
const response = await api.patch(
`/checkout-sessions/${sessionId}`,
data
);

return response.data;
}

export async function markCheckoutSessionPaymentPending(
sessionId,
data
) {
const response = await api.patch(
`/checkout-sessions/${sessionId}/payment-pending`,
data
);

return response.data;
}

export async function deleteCheckoutSession(
sessionId
) {
const response = await api.delete(
`/checkout-sessions/${sessionId}`
);

return response.data;
}
