import { apiFetchJson, apiPath } from "./base";
import { syncEnrolledCoursesFromApi } from "../utils/enrollments";

export async function fetchMyEnrollments() {
  const data = await apiFetchJson(apiPath("/api/enrollments"));
  if (data.success && Array.isArray(data.enrollments)) {
    syncEnrolledCoursesFromApi(data.enrollments);
  }
  return data;
}

export async function fetchCourseLessons(courseId) {
  return apiFetchJson(apiPath(`/api/enrollments/${courseId}/lessons`));
}

export async function updateCourseProgress(courseId, progress) {
  return apiFetchJson(apiPath(`/api/enrollments/${courseId}/progress`), {
    method: "PUT",
    body: JSON.stringify({ progress })
  });
}
