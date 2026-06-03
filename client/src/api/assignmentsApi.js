import { apiFetchJson, apiPath } from "./base";

export async function fetchAssignmentsByLesson(lessonId) {
  return apiFetchJson(apiPath(`/api/assignments/lesson/${lessonId}`));
}

export async function fetchAssignmentDetail(assignmentId) {
  return apiFetchJson(apiPath(`/api/assignments/${assignmentId}`));
}

export async function fetchMySubmission(assignmentId) {
  return apiFetchJson(apiPath(`/api/assignments/${assignmentId}/my-submission`));
}

export async function fetchAllMySubmissions() {
  return apiFetchJson(apiPath(`/api/assignments/my-submissions/all`));
}

// Dùng cho submit cả Quiz và Essay
export async function submitAssignment(assignmentId, formDataOrBody, isFormData = false) {
  const options = { method: "POST" };
  
  if (isFormData) {
    options.body = formDataOrBody;
    options.headers = {}; // để trình duyệt tự set multipart/form-data
  } else {
    options.body = JSON.stringify(formDataOrBody);
    options.headers = { "Content-Type": "application/json" };
  }

  return apiFetchJson(apiPath(`/api/assignments/${assignmentId}/submit`), options);
}
