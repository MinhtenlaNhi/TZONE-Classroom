const ONBOARDED_EMAILS_KEY = "tzone_onboarded_emails";
const PENDING_REGISTER_ROLE_KEY = "tzone_pending_register_role";

/** Lưu vai trò chọn ở trang /register trước khi đăng nhập Google (session). */
export function setPendingRegisterRole(role) {
  if (role !== "teacher" && role !== "student") return;
  try {
    sessionStorage.setItem(PENDING_REGISTER_ROLE_KEY, role);
  } catch {
    /* ignore */
  }
}

/** Đọc và xóa vai trò pending (gọi một lần khi vào onboarding). */
export function consumePendingRegisterRole() {
  try {
    const v = sessionStorage.getItem(PENDING_REGISTER_ROLE_KEY);
    sessionStorage.removeItem(PENDING_REGISTER_ROLE_KEY);
    if (v === "teacher" || v === "student") return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function clearPendingRegisterRole() {
  try {
    sessionStorage.removeItem(PENDING_REGISTER_ROLE_KEY);
  } catch {
    /* ignore */
  }
}

export function normalizeEmail(email) {
  return String(email || "")
    .toLowerCase()
    .trim();
}

/** User đã hoàn tất bước chọn vai trò (lưu cục bộ theo email). */
export function hasCompletedOnboarding(email) {
  const e = normalizeEmail(email);
  if (!e) return false;
  try {
    const list = JSON.parse(localStorage.getItem(ONBOARDED_EMAILS_KEY) || "[]");
    return Array.isArray(list) && list.includes(e);
  } catch {
    return false;
  }
}

export function markOnboardingComplete(email) {
  const e = normalizeEmail(email);
  if (!e) return;
  const prev = new Set(JSON.parse(localStorage.getItem(ONBOARDED_EMAILS_KEY) || "[]"));
  prev.add(e);
  localStorage.setItem(ONBOARDED_EMAILS_KEY, JSON.stringify([...prev]));
}
