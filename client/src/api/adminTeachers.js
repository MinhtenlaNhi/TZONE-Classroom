import { apiFetchJson } from "./base";

export async function fetchPendingTeachers() {
  return apiFetchJson("/api/admin/pending-teachers");
}

export async function fetchAllTeachers() {
  return apiFetchJson("/api/admin/teachers");
}

export async function approveTeacher({ teacherEmail }) {
  return apiFetchJson("/api/admin/approve-teacher", {
    method: "POST",
    body: JSON.stringify({ teacherEmail })
  });
}

export async function rejectTeacher({ teacherEmail }) {
  return apiFetchJson("/api/admin/reject-teacher", {
    method: "POST",
    body: JSON.stringify({ teacherEmail })
  });
}
