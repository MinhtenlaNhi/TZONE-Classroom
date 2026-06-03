import { getToken } from "../auth/auth";

/** Base URL cho API — dev: để trống để dùng proxy Vite `/api` → localhost:5000 */
export function apiPath(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

/** Tạo headers mặc định với JWT token (nếu có). */
export function authHeaders(extra = {}) {
  const headers = { "Content-Type": "application/json", ...extra };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch wrapper tự động gắn JWT token.
 * @param {string} url
 * @param {RequestInit} options
 */
export async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Chỉ set Content-Type nếu body không phải FormData
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(apiPath(url), { ...options, headers });
}

/**
 * Fetch wrapper tự động gắn JWT token và tự động parse response JSON.
 * @param {string} url
 * @param {RequestInit} options
 */
export async function apiFetchJson(url, options = {}) {
  const res = await apiFetch(url, options);
  return res.json().catch(() => ({ success: false, message: "Lỗi kết nối hoặc định dạng JSON" }));
}
