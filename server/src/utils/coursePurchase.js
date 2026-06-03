const COL_LABELS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

function jsDayToCol(d) {
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}

function parseStartDate(str, refYear = new Date().getFullYear()) {
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

/** Ngày buổi học cuối cùng của khóa (theo startDate + totalSessions). */
function getCourseLastSessionDate(course, refYear = new Date().getFullYear()) {
  const total = Number(course.totalSessions) || 0;
  const slots = course.sessions || [];
  if (!total || !slots.length) return null;

  const start = parseStartDate(course.startDate, refYear);
  if (!start) return null;

  let count = 0;
  const d = new Date(start);
  const maxDays = 366 * 3;

  for (let i = 0; i < maxDays && count < total; i++) {
    const col = jsDayToCol(d);
    for (const s of slots) {
      if (s.col === col) {
        count++;
        if (count >= total) {
          const last = new Date(d);
          last.setHours(23, 59, 59, 999);
          return last;
        }
      }
    }
    d.setDate(d.getDate() + 1);
  }

  return null;
}

function isCourseEnded(course, now = new Date()) {
  const lastSession = getCourseLastSessionDate(course);
  if (!lastSession) return false;
  return now > lastSession;
}

function isEnrollmentCompleted(enrollment) {
  return Number(enrollment?.progress) >= 100;
}

/**
 * Học viên có được phép mua / thêm giỏ khóa này không.
 * @returns {{ ok: boolean, message?: string }}
 */
function checkCoursePurchaseEligibility(course, enrollment) {
  if (!enrollment) {
    return { ok: true };
  }

  if (enrollment.isTrial) {
    return { ok: true };
  }

  if (isEnrollmentCompleted(enrollment)) {
    return { ok: true };
  }

  if (isCourseEnded(course)) {
    return { ok: true };
  }

  return {
    ok: false,
    message:
      "Bạn đang học khóa này. Chỉ có thể mua lại sau khi hoàn thành khóa học (100% tiến độ) hoặc khi khóa học đã kết thúc."
  };
}

/** Ghi nhận enrollment sau thanh toán — tạo mới hoặc gia hạn học lại. */
async function fulfillPaidEnrollment(Enrollment, { userId, courseId, orderId }) {
  await Enrollment.deleteOne({ user: userId, course: courseId, isTrial: true });

  const existing = await Enrollment.findOne({
    user: userId,
    course: courseId,
    isTrial: false
  });

  if (existing) {
    existing.order = orderId;
    existing.progress = 0;
    existing.isTrial = false;
    existing.enrolledAt = new Date();
    await existing.save();
    return existing;
  }

  return Enrollment.create({
    user: userId,
    course: courseId,
    order: orderId,
    isTrial: false,
    progress: 0
  });
}

module.exports = {
  COL_LABELS,
  checkCoursePurchaseEligibility,
  fulfillPaidEnrollment,
  isCourseEnded,
  isEnrollmentCompleted,
  getCourseLastSessionDate
};
