import { apiPath } from "./base";

export async function fetchCourseLinks(courseId) {
  const res = await fetch(apiPath(`/api/course-links/${encodeURIComponent(courseId)}`));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Không tải được link lớp học.");
  }
  return data;
}

/** Giáo viên / admin: lưu link cố định cho cả khóa học */
export async function putCourseMeetLink({ courseId, email, password, meetUrl }) {
  const res = await fetch(apiPath(`/api/course-links/${encodeURIComponent(courseId)}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, meetUrl })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Không lưu được link.");
  }
  return data;
}

/** @deprecated dùng putCourseMeetLink */
export const putCourseSessionLink = putCourseMeetLink;
