import { apiFetchJson, apiPath } from "./base";

export async function fetchAdminCategories() {
  return apiFetchJson(apiPath("/api/admin/categories"));
}

export async function createAdminCategory(data) {
  return apiFetchJson(apiPath("/api/admin/categories"), {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function updateAdminCategory(id, data) {
  return apiFetchJson(apiPath(`/api/admin/categories/${id}`), {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function deleteAdminCategory(id) {
  return apiFetchJson(apiPath(`/api/admin/categories/${id}`), {
    method: "DELETE"
  });
}
