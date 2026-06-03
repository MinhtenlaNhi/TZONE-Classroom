import { setEnrolledCourseIds } from "../auth/enrolledCoursesStorage";

/** Enrollment có khóa học hợp lệ để hiển thị. */
export function getVisibleEnrollments(enrollments) {
  return (enrollments || []).filter((enr) => enr?.course && (enr.course.title || enr.course.id));
}

/** URL vào không gian học — ưu tiên ObjectId, fallback slug id. */
export function getCourseLearnPath(course) {
  if (!course) return "/courses";
  return `/learn/${course._id || course.id}`;
}

/** Đồng bộ localStorage đăng ký với API (dùng slug id nếu có). */
export function syncEnrolledCoursesFromApi(enrollments) {
  const ids = getVisibleEnrollments(enrollments)
    .map((enr) => String(enr.course.id || enr.course._id))
    .filter(Boolean);
  setEnrolledCourseIds([...new Set(ids)]);
}
