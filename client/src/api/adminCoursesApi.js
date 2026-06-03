import { apiPath, apiFetchJson } from "./base";

async function adminPost(path, body) {
  const res = await fetch(apiPath(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Yêu cầu thất bại.");
  }
  return data;
}

export function fetchAdminCoursesList({ adminEmail, adminPassword }) {
  return adminPost("/api/admin/courses-list", { adminEmail, adminPassword });
}

export function createAdminCourse({ adminEmail, adminPassword, course }) {
  return adminPost("/api/admin/courses", { adminEmail, adminPassword, course });
}

// --- V2 API (Dùng JWT) ---

export async function fetchAdminCoursesV2() {
  return apiFetchJson(apiPath("/api/admin/v2/courses"));
}

export async function createAdminCourseV2(formData) {
  // formData là đối tượng FormData để hỗ trợ upload file
  // Xóa Content-Type để browser tự sinh Content-Type: multipart/form-data; boundary=...
  const headers = {};
  return apiFetchJson(apiPath("/api/admin/v2/courses"), {
    method: "POST",
    headers,
    body: formData
  });
}

export async function updateAdminCourseV2(id, formData) {
  const headers = {};
  return apiFetchJson(apiPath(`/api/admin/v2/courses/${id}`), {
    method: "PUT",
    headers,
    body: formData
  });
}

export async function deleteAdminCourseV2(id) {
  return apiFetchJson(apiPath(`/api/admin/v2/courses/${id}`), {
    method: "DELETE"
  });
}
