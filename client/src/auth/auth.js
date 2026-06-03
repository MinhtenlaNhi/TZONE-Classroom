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

/** Lưu JWT token */
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

/** Lấy JWT token */
export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
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

/** Role thực tế theo JWT (đồng bộ với CSDL tại thời điểm đăng nhập). */
export function getTokenRole() {
  const payload = decodeJwtPayload(getToken());
  return payload?.role || null;
}

/** Lưu thông tin user (JSON) vào session */
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

    // Nguồn chân lý cho quyền là JWT (khớp role trong CSDL lúc đăng nhập).
    // Tránh trường hợp session cũ trong sessionStorage còn role sai (vd: student
    // lọt vào khu vực /admin) trong khi server vẫn trả 403 theo role thật.
    const tokenRole = getTokenRole();
    if (tokenRole) {
      data.role = tokenRole;
    }

    // Luôn đồng bộ từ ADMIN_EMAILS — tránh session cũ còn role sai sau khi đổi cấu hình.
    if (ADMIN_EMAILS.has(data.email?.toLowerCase())) {
      data.role = "admin";
    }
    return data;
  } catch {
    return null;
  }
}

export function clearAuth() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
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
