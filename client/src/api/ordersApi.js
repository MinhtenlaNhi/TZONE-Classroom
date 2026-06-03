import { apiFetchJson, apiPath } from "./base";

export async function fetchMyOrders() {
  return apiFetchJson(apiPath("/api/orders"));
}

export async function fetchPaymentMethods() {
  return apiFetchJson(apiPath("/api/payment-methods"));
}

export async function fetchOrderDetails(orderId) {
  return apiFetchJson(apiPath(`/api/orders/${orderId}`));
}

// formData vì có upload ảnh receipt
export async function createOrder(formData) {
  return apiFetchJson(apiPath("/api/orders"), {
    method: "POST",
    headers: {}, // Để trống để fetch tự set Content-Type: multipart/form-data
    body: formData
  });
}

// ---- Admin Orders ----

export async function fetchAdminOrders(page = 1, limit = 20, status = "") {
  const query = new URLSearchParams({ page, limit });
  if (status) query.append("status", status);
  return apiFetchJson(apiPath(`/api/admin/orders?${query.toString()}`));
}

export async function confirmOrder(orderId) {
  return apiFetchJson(apiPath(`/api/admin/orders/${orderId}/confirm`), {
    method: "PUT"
  });
}

export async function cancelOrder(orderId, reason = "") {
  return apiFetchJson(apiPath(`/api/admin/orders/${orderId}/cancel`), {
    method: "PUT",
    body: JSON.stringify({ reason })
  });
}
