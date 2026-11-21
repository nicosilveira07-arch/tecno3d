import api from "./api";

export async function createQuoteRequest(formData) {
  const response = await api.post("/quotes", formData, {
    timeout: 120_000,
  });

  return response.data;
}

export async function getMyQuotes() {
  const response = await api.get("/quotes/mine");

  return response.data;
}

export async function acceptQuote(quoteId) {
  const response = await api.post(
    `/quotes/${quoteId}/accept`
  );

  return response.data;
}

export async function rejectQuote(quoteId) {
  const response = await api.post(
    `/quotes/${quoteId}/reject`
  );

  return response.data;
}

export async function getQuoteAdminSummary() {
  const response = await api.get(
    "/quotes/admin/summary"
  );

  return response.data;
}

export async function getAdminQuotes(status) {
  const response = await api.get(
    "/quotes/admin",
  {
    params: status
      ? { status }
      : undefined,
  }
  );

  return response.data;
}

export async function sendQuotePrice(
  quoteId,
  data
) {
  const response = await api.patch(
    `/quotes/admin/${quoteId}`,
    data
  );

  return response.data;
}