import { apiPath } from "./base";

/** Danh sách giảng viên đã duyệt + mã CTxxxx (công khai, không cần mật khẩu admin). */
export async function fetchPublicInstructors() {
  const res = await fetch(apiPath("/api/instructors"));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Không tải được danh sách giảng viên.");
  }
  return data;
}
