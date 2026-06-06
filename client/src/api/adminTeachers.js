import { apiFetchJson } from "./base";

export async function fetchAllTeachers() {
  return apiFetchJson("/api/admin/teachers");
}

export async function createTeacher({ name, email, password, phone = "" }) {
  return apiFetchJson("/api/admin/teachers", {
    method: "POST",
    body: JSON.stringify({ name, email, password, phone })
  });
}

export async function updateTeacher(id, { name, email, password, phone }) {
  return apiFetchJson(`/api/admin/teachers/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, email, password, phone })
  });
}
