/**
 * Lịch học định kỳ theo tuần.
 * col: 0 = Thứ 2 … 6 = Chủ nhật (cột lịch VN).
 * startMin / endMin: phút từ 0h (0–1440).
 */

/** @param {{ startMin: number, endMin: number }} s */
export function formatSessionTime(s) {
  const h1 = Math.floor(s.startMin / 60);
  const m1 = s.startMin % 60;
  const h2 = Math.floor(s.endMin / 60);
  const m2 = s.endMin % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${h1}h${pad(m1)} - ${h2}h${pad(m2)}`;
}

/** Hai khoảng [a0,a1) và [b0,b1) giao nhau (trùng ít nhất một phút). */
export function timeRangesOverlap(a0, a1, b0, b1) {
  return a0 < b1 && b0 < a1;
}

/**
 * @param {Array<{ col: number, startMin: number, endMin: number }>} sessionsA
 * @param {Array<{ col: number, startMin: number, endMin: number }>} sessionsB
 * @returns {{ col: number, a: typeof sessionsA[0], b: typeof sessionsB[0] } | null}
 */
export function findFirstScheduleConflict(sessionsA, sessionsB) {
  for (const a of sessionsA) {
    for (const b of sessionsB) {
      if (a.col !== b.col) continue;
      if (timeRangesOverlap(a.startMin, a.endMin, b.startMin, b.endMin)) {
        return { col: a.col, a, b };
      }
    }
  }
  return null;
}

/**
 * So khóa mới với danh sách khóa đã đăng ký (đã có sessions).
 * @returns {null | { enrolledTitle: string, newTitle: string, weekdayLabel: string, timeLabel: string }}
 */
export function findEnrollmentConflict(newCourse, enrolledCourses) {
  const newSessions = newCourse.sessions || [];
  for (const en of enrolledCourses) {
    const ex = en.sessions || [];
    const hit = findFirstScheduleConflict(ex, newSessions);
    if (hit) {
      const weekdayLabel = COL_LABELS[hit.col];
      return {
        enrolledTitle: en.title,
        newTitle: newCourse.title,
        weekdayLabel,
        timeLabel: `${formatSessionTime(hit.a)} ↔ ${formatSessionTime(hit.b)}`
      };
    }
  }
  return null;
}

export const COL_LABELS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

/** Thứ trong tuần (0=CN … 6=Thứ 7) của Date JS -> col 0..6 */
export function jsDayToCol(d) {
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}

/** Ngày đầu tuần (Thứ 2) 00:00 local */
export function startOfWeekMonday(date) {
  const d = new Date(date);
  const col = jsDayToCol(d);
  d.setDate(d.getDate() - col);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, n) {
  const x = new Date(date);
  x.setDate(x.getDate() + n);
  return x;
}

/** dd/mm */
export function formatDayDM(d) {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

/** Cùng ngày lịch (bỏ qua giờ). */
export function isSameCalendarDay(a, b) {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
}

/**
 * Parse ngày khai giảng dạng dd/mm, dd/mm/yyyy hoặc dd-mm-yyyy.
 * Nếu không có năm, dùng refYear (thường là năm đang xem trên lịch).
 * @returns {Date | null}
 */
export function parseStartDate(str, refYear = new Date().getFullYear()) {
  if (!str || typeof str !== "string") return null;
  const parts = str.trim().split(/[/\-.]/).map((p) => parseInt(p, 10));
  if (parts.length < 2 || parts.some((n) => !Number.isFinite(n))) return null;

  const day = parts[0];
  const month = parts[1] - 1;
  let year = parts.length >= 3 ? parts[2] : refYear;
  if (year < 100) year += 2000;

  const d = new Date(year, month, day);
  if (d.getDate() !== day || d.getMonth() !== month) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Đếm số buổi học (theo slots sessions) từ fromDate đến toDate (bao gồm cả hai đầu). */
export function countSessionsInRange(course, fromDate, toDate) {
  const slots = course.sessions || [];
  if (!slots.length) return 0;

  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(toDate);
  end.setHours(0, 0, 0, 0);
  if (end < start) return 0;

  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    const col = jsDayToCol(d);
    for (const s of slots) {
      if (s.col === col) count++;
    }
    d.setDate(d.getDate() + 1);
  }
  return count;
}

/**
 * Buổi học của khóa trên một ngày cụ thể (tôn trọng startDate + totalSessions).
 * @param {{ sessions?: Array, startDate?: string, totalSessions?: number }} course
 * @param {Date} date
 */
export function getCourseSessionsForDate(course, date) {
  const slots = course.sessions || [];
  if (!slots.length) return [];

  const dayCol = jsDayToCol(date);
  const daySlots = slots.filter((s) => s.col === dayCol);
  if (!daySlots.length) return [];

  const total = Number(course.totalSessions) || 0;
  if (total <= 0) return daySlots;

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const start = parseStartDate(course.startDate, dayStart.getFullYear());
  if (!start) return daySlots;
  if (dayStart < start) return [];

  if (countSessionsInRange(course, start, dayStart) > total) return [];
  return daySlots;
}

/**
 * Đang trong giờ học của buổi định kỳ (cột col khớp ngày `sessionDate`).
 * @param {Date} sessionDate — ngày của ô trên lịch tuần
 * @param {{ col: number, startMin: number, endMin: number }} session
 */
export function isSessionLiveOnDate(sessionDate, session) {
  const now = new Date();
  if (!isSameCalendarDay(sessionDate, now)) return false;
  if (jsDayToCol(now) !== session.col) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= session.startMin && mins <= session.endMin;
}
