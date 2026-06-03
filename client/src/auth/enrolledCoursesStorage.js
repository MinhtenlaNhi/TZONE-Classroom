import { getAuth } from "./auth";

function emitCoursesChanged() {
  try {
    window.dispatchEvent(new CustomEvent("tzone-courses-changed"));
  } catch {
    /* ignore */
  }
}

function storageKey() {
  const email = getAuth()?.email;
  return email ? `tzone_enrolled_${email}` : "tzone_enrolled_guest";
}

export function getEnrolledCourseIds() {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function setEnrolledCourseIds(ids) {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(ids));
    emitCoursesChanged();
  } catch {
    /* ignore */
  }
}

export function addEnrolledCourseId(courseId) {
  const ids = getEnrolledCourseIds();
  if (ids.includes(courseId)) return;
  ids.push(courseId);
  setEnrolledCourseIds(ids);
}

export function isCourseEnrolled(courseId) {
  return getEnrolledCourseIds().includes(courseId);
}

/** Lần đầu vào app: thêm khóa mẫu (Tập sự ST35) để lịch có dữ liệu demo — chỉ khi danh sách đang trống. */
export function initDemoEnrollmentOnce() {
  const flag = "tzone_schedule_demo_seeded";
  if (localStorage.getItem(flag)) return;
  if (getEnrolledCourseIds().length > 0) {
    localStorage.setItem(flag, "1");
    return;
  }
  addEnrolledCourseId("st35");
  localStorage.setItem(flag, "1");
}

function completedStorageKey() {
  const email = getAuth()?.email;
  return email ? `tzone_completed_${email}` : "tzone_completed_guest";
}

export function getCompletedCourseIds() {
  try {
    const raw = localStorage.getItem(completedStorageKey());
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function setCompletedCourseIds(ids) {
  try {
    localStorage.setItem(completedStorageKey(), JSON.stringify(ids));
    emitCoursesChanged();
  } catch {
    /* ignore */
  }
}

/** Đánh dấu khóa đã hoàn thành (phải đã đăng ký). */
export function addCompletedCourseId(courseId) {
  if (!getEnrolledCourseIds().includes(courseId)) return;
  const ids = getCompletedCourseIds();
  if (ids.includes(courseId)) return;
  ids.push(courseId);
  setCompletedCourseIds(ids);
}

/** Đưa khóa về trạng thái đang học (gỡ khỏi danh sách hoàn thành). */
export function removeCompletedCourseId(courseId) {
  const ids = getCompletedCourseIds().filter((id) => id !== courseId);
  setCompletedCourseIds(ids);
}

export function isCourseCompleted(courseId) {
  return getCompletedCourseIds().includes(courseId);
}

/** Đã đăng ký nhưng chưa hoàn thành. */
export function getOngoingCourseIds() {
  const done = new Set(getCompletedCourseIds());
  return getEnrolledCourseIds().filter((id) => !done.has(id));
}

/** Đã đánh dấu hoàn thành và vẫn nằm trong lịch sử đăng ký. */
export function getCompletedEnrolledCourseIds() {
  const enrolled = new Set(getEnrolledCourseIds());
  return getCompletedCourseIds().filter((id) => enrolled.has(id));
}
