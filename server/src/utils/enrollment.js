function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isEnrollmentOpen(course, now = new Date()) {
  if (!course) return false;

  const open = toDate(course.enrollmentOpenDate);
  const close = toDate(course.enrollmentCloseDate);

  if (!open && !close) return true;
  if (open && now < open) return false;
  if (close && now > close) return false;
  return true;
}

module.exports = { isEnrollmentOpen };
