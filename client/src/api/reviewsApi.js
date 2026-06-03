import { apiFetchJson, apiPath } from "./base";

export async function fetchCourseReviews(courseId) {
  return apiFetchJson(apiPath(`/api/reviews/course/${courseId}`));
}

export async function submitReview(courseId, rating, comment) {
  return apiFetchJson(apiPath(`/api/reviews`), {
    method: "POST",
    body: JSON.stringify({ courseId, rating, comment })
  });
}

export async function fetchMyReviews() {
  return apiFetchJson(apiPath(`/api/reviews/me`));
}

// ---- Admin Reviews ----

export async function fetchAdminReviews(courseId = "") {
  let url = "/api/admin/reviews";
  if (courseId) url += `?courseId=${courseId}`;
  return apiFetchJson(apiPath(url));
}

export async function toggleHideReview(reviewId) {
  return apiFetchJson(apiPath(`/api/admin/reviews/${reviewId}/toggle-hide`), {
    method: "PUT"
  });
}

export async function deleteReview(reviewId) {
  return apiFetchJson(apiPath(`/api/admin/reviews/${reviewId}`), {
    method: "DELETE"
  });
}
