/**
 * Trạng thái phê duyệt giáo viên (đăng ký email). Thiếu field = tài khoản cũ, coi như đã duyệt.
 */
export function normalizedTeacherApprovalStatus(auth) {
  if (!auth || auth.role !== "teacher") return undefined;
  return auth.teacherApprovalStatus ?? "approved";
}

/** Giáo viên được dùng trang gửi link buổi học (API server cũng kiểm tra). */
export function canUseTeacherCourseLinkTools(auth) {
  if (!auth) return false;
  if (auth.role === "admin") return true;
  if (auth.role !== "teacher") return false;
  return normalizedTeacherApprovalStatus(auth) === "approved";
}
