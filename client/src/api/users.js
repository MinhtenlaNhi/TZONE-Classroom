import { apiFetch } from "./base";

/* ───── GET PROFILE ───── */
export async function getProfile() {
  const res = await apiFetch("/api/users/me");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Lỗi lấy thông tin.");
  }
  return data;
}

/* ───── UPDATE PROFILE ───── */
export async function updateProfile({ name, phone }) {
  const res = await apiFetch("/api/users/me", {
    method: "PUT",
    body: JSON.stringify({ name, phone })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Lỗi cập nhật thông tin.");
  }
  return data;
}

/* ───── UPLOAD AVATAR ───── */
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await apiFetch("/api/users/me/avatar", {
    method: "POST",
    body: formData
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Lỗi upload avatar.");
  }
  return data;
}
