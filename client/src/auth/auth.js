export const AUTH_STORAGE_KEY = "tzone_auth";
export const TOKEN_STORAGE_KEY = "tzone_token";

/** Email Google được cấp quyền quản trị (so khớp không phân biệt hoa thường). */
export const ADMIN_EMAILS = new Set(["pdquang050203@gmail.com"]);

export function resolveRole(email) {
  const e = String(email || "")
    .toLowerCase()
    .trim();
  return ADMIN_EMAILS.has(e) ? "admin" : "user";
}

/** Giải mã payload JWT (không xác thực chữ ký — chỉ để đọc role/email phía client). */
function decodeJwtPayload(token) {
  try {
    const part = String(token).split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function getTokenPayload() {
  return decodeJwtPayload(getToken());
}

/**
 * Lưu JWT token theo từng tab (sessionStorage).
 * Tránh trường hợp mở song song nhiều tab với role khác nhau bị ghi đè lẫn nhau
 * khi token nằm chung trong localStorage.
 */
export function setToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }
  // Dọn token legacy dùng chung toàn trình duyệt (phiên bản cũ).
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/** Lấy JWT token của tab hiện tại. */
export function getToken() {
  const sessionToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (sessionToken) return sessionToken;

  // Migration một lần cho tab đang mở: token cũ trong localStorage → sessionStorage.
  const legacyToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (legacyToken) {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, legacyToken);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return legacyToken;
  }

  return null;
}

/** Role thực tế theo JWT của tab hiện tại. */
export function getTokenRole() {
  return getTokenPayload()?.role || null;
}

/** Lưu thông tin user (JSON) vào session của tab hiện tại. */
export function setAuth(data) {
  if (data) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  }
}

export function getAuth() {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.email) return null;

    const sessionEmail = data.email.toLowerCase().trim();
    const tokenPayload = getTokenPayload();
    const tokenEmail = tokenPayload?.email?.toLowerCase?.().trim();

    // Chỉ đồng bộ role từ JWT khi token thuộc đúng tài khoản của tab này.
    if (tokenPayload && tokenEmail && tokenEmail === sessionEmail && tokenPayload.role) {
      data.role = tokenPayload.role;
    }

    // Luôn đồng bộ từ ADMIN_EMAILS — tránh session cũ còn role sai sau khi đổi cấu hình.
    if (ADMIN_EMAILS.has(sessionEmail)) {
      data.role = "admin";
    }
    return data;
  } catch {
    return null;
  }
}

export function clearAuth() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function isAdminSession() {
  return getAuth()?.role === "admin";
}

/** Bộ phận vận hành — quyền hạn chế trong khu vực quản trị. */
export function isOperationSession() {
  return getAuth()?.role === "operation";
}

/** Admin hoặc Bộ phận vận hành — được vào khu vực /admin. */
export function isStaffSession() {
  const role = getAuth()?.role;
  return role === "admin" || role === "operation";
}

/** Các đường dẫn trong /admin mà Bộ phận vận hành được phép truy cập. */
export const OPERATION_ALLOWED_PATHS = [
  "/admin/categories",
  "/admin/courses",
  "/admin/orders",
  "/admin/reviews"
];

/** Trang mặc định khi vào /admin theo role. */
export function getAdminHomePath() {
  return isOperationSession() ? "/admin/categories" : "/admin/dashboard";
}
