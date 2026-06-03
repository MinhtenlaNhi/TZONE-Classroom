import { apiPath, authHeaders, apiFetch } from "./base";

/* ───── CHECK EMAIL ───── */
export async function checkEmailForRegister(email) {
  const res = await fetch(apiPath("/api/auth/check-email"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Không kiểm tra được email.");
  }
  return data;
}

/* ───── LOGIN ───── */
export async function loginWithEmail({ email, password }) {
  const res = await fetch(apiPath("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Đăng nhập thất bại.");
  }
  return data; // { success, token, user }
}

/* ───── REGISTER ───── */
export async function registerAccount({ email, name, password, role }) {
  const res = await fetch(apiPath("/api/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password, role })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Đăng ký thất bại.");
    err.code = data.code;
    throw err;
  }
  return data; // { success, token, user }
}

/* ───── GOOGLE SYNC ───── */
export async function syncGoogleAccount({ email, name, picture }) {
  const res = await fetch(apiPath("/api/auth/google-sync"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, picture })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Không lưu được tài khoản Google.");
    err.code = data.code;
    throw err;
  }
  return data; // { success, token, user }
}

/* ───── FORGOT PASSWORD ───── */
export async function forgotPassword(email) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  let res;
  try {
    res = await fetch(apiPath("/api/auth/forgot-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      signal: controller.signal
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Yêu cầu quá lâu. Kiểm tra server đang chạy rồi thử lại.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Lỗi gửi yêu cầu.");
  }
  return data;
}

/* ───── RESET PASSWORD ───── */
export async function resetPassword(token, password) {
  const res = await fetch(apiPath("/api/auth/reset-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Lỗi đặt lại mật khẩu.");
  }
  return data;
}

/* ───── CHANGE PASSWORD ───── */
export async function changePassword(currentPassword, newPassword) {
  const res = await apiFetch("/api/auth/change-password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Lỗi đổi mật khẩu.");
  }
  return data;
}

/* ───── GET CURRENT USER ───── */
export async function getCurrentUser() {
  const res = await apiFetch("/api/auth/me");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Lỗi lấy thông tin.");
  }
  return data;
}
