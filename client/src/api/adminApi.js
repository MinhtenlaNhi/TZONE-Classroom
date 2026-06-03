import { apiFetchJson, apiPath } from "./base";

export async function fetchDashboardStats() {
  return apiFetchJson("/api/admin/dashboard");
}

export async function fetchAdminUsers(page = 1, search = "", role = "") {
  const query = new URLSearchParams({ page });
  if (search) query.append("search", search);
  if (role) query.append("role", role);
  
  return apiFetchJson(`/api/admin/users?${query.toString()}`);
}

export async function toggleBlockUser(userId) {
  return apiFetchJson(`/api/admin/users/${userId}/toggle-block`, {
    method: "PUT"
  });
}

export async function createUser(data) {
  return apiFetchJson("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function updateUser(userId, data) {
  return apiFetchJson(`/api/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function fetchUserOrders(userId) {
  return apiFetchJson(`/api/admin/users/${userId}/orders`);
}

export async function changeUserRole(userId, role) {
  return apiFetchJson(`/api/admin/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role })
  });
}
