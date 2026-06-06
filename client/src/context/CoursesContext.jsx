import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiPath } from "../api/base";

const CoursesContext = createContext(null);

function normalizeRemoteCourse(doc) {
  if (!doc?.id) return null;
  const sessions = Array.isArray(doc.sessions)
    ? doc.sessions
        .map((s) => ({
          col: Number(s.col),
          startMin: Number(s.startMin),
          endMin: Number(s.endMin)
        }))
        .filter((s) => s.col >= 0 && s.col <= 6 && Number.isFinite(s.startMin) && Number.isFinite(s.endMin))
    : [];
  return {
    id: String(doc.id),
    categoryId: String(doc.categoryId || ""),
    badge: doc.badge != null ? String(doc.badge) : "",
    title: String(doc.title || ""),
    schedule: doc.schedule != null ? String(doc.schedule) : "",
    sessions,
    startDate: doc.startDate != null ? String(doc.startDate) : "",
    totalSessions: Number(doc.totalSessions) || 0,
    sessionDuration: Number(doc.sessionDuration) || 90,
    enrolled: doc.enrolled != null ? String(doc.enrolled) : "0",
    capacity: doc.capacity != null ? String(doc.capacity) : "30",
    rating: Math.min(5, Math.max(0, Number(doc.rating) || 0)),
    ratingLabel: doc.ratingLabel != null ? String(doc.ratingLabel) : "—",
    price: doc.price != null ? String(doc.price) : "",
    instructor: doc.instructor != null ? String(doc.instructor) : "",
    instructorRef: doc.instructorRef ? String(doc.instructorRef) : null
  };
}

function getCourseByIdFromList(list, id) {
  if (id == null || id === "") return null;
  const s = String(id);
  return list.find((c) => String(c.id) === s) || null;
}

function getCoursesByIdsFromList(list, ids) {
  return ids.map((id) => getCourseByIdFromList(list, id)).filter(Boolean);
}

export function CoursesProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);

  const refreshCourses = useCallback(async () => {
    try {
      const res = await fetch(apiPath("/api/courses"));
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && Array.isArray(data.courses)) {
        const list = data.courses.map(normalizeRemoteCourse).filter(Boolean);
        setCourses(list);
      }
    } catch {
      /* giữ danh sách cũ */
    } finally {
      setCoursesLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  useEffect(() => {
    function onChanged() {
      refreshCourses();
    }
    window.addEventListener("tzone-courses-changed", onChanged);
    return () => window.removeEventListener("tzone-courses-changed", onChanged);
  }, [refreshCourses]);

  const value = useMemo(
    () => ({
      courses,
      coursesLoaded,
      refreshCourses,
      getCourseById: (id) => getCourseByIdFromList(courses, id),
      getCoursesByIds: (ids) => getCoursesByIdsFromList(courses, ids)
    }),
    [courses, coursesLoaded, refreshCourses]
  );

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
}

export function useCourses() {
  const ctx = useContext(CoursesContext);
  if (!ctx) {
    throw new Error("useCourses phải dùng bên trong CoursesProvider.");
  }
  return ctx;
}
