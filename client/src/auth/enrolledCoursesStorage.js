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
