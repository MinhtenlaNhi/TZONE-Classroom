const COL_LABELS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

function formatSessionTime(s) {
  const h1 = Math.floor(s.startMin / 60);
  const m1 = s.startMin % 60;
  const h2 = Math.floor(s.endMin / 60);
  const m2 = s.endMin % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${h1}h${pad(m1)} - ${h2}h${pad(m2)}`;
}

function timeRangesOverlap(a0, a1, b0, b1) {
  return a0 < b1 && b0 < a1;
}

function findFirstScheduleConflict(sessionsA, sessionsB) {
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
 * Kiểm tra lịch mới có trùng khung giờ với khóa khác của cùng giáo viên.
 * @param {import("mongoose").Types.ObjectId | string} instructorRef
 * @param {Array<{ col: number, startMin: number, endMin: number }>} newSessions
 * @param {import("mongoose").Types.ObjectId | string | null} excludeCourseId — bỏ qua khi sửa khóa
 */
async function findInstructorScheduleConflict(Course, instructorRef, newSessions, excludeCourseId = null) {
  if (!instructorRef || !Array.isArray(newSessions) || newSessions.length === 0) {
    return null;
  }

  const filter = { instructorRef };
  if (excludeCourseId) {
    filter._id = { $ne: excludeCourseId };
  }

  const existingCourses = await Course.find(filter).select("title sessions").lean();

  for (const course of existingCourses) {
    const hit = findFirstScheduleConflict(course.sessions || [], newSessions);
    if (hit) {
      return {
        conflictingCourseTitle: course.title,
        weekdayLabel: COL_LABELS[hit.col] || `Cột ${hit.col}`,
        timeLabel: `${formatSessionTime(hit.a)} ↔ ${formatSessionTime(hit.b)}`
      };
    }
  }

  return null;
}

function buildInstructorConflictMessage(conflict) {
  return (
    `Giáo viên đang phụ trách khóa "${conflict.conflictingCourseTitle}" trùng lịch ` +
    `vào ${conflict.weekdayLabel} (${conflict.timeLabel}). ` +
    `Vui lòng chọn giáo viên hoặc khung giờ khác.`
  );
}

module.exports = {
  findInstructorScheduleConflict,
  buildInstructorConflictMessage,
  findFirstScheduleConflict
};
