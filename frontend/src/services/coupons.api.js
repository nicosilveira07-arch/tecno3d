import api from "./api";

export async function validateCoupon(code) {
  const response = await api.post(
    "/coupons/validate",
    {
      code,
    }
  );

  return response.data;
}

export async function getCoupons() {
  const response = await api.get(
    "/coupons"
  );

  return response.data;
}

export async function getCouponById(id) {
  const response = await api.get(
    `/coupons/${id}`
  );

  return response.data;
}

export async function createCoupon(data) {
  const response = await api.post(
    "/coupons",
    data
  );

  return response.data;
}

export async function updateCoupon(id, data) {
  const response = await api.put(
    `/coupons/${id}`,
    data
  );

  return response.data;
}

export async function deleteCoupon(id) {
  const response = await api.delete(
    `/coupons/${id}`
  );

  return response.data;
}