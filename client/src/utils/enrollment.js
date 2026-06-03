import { formatDateTimeVN } from "./datetime";

/** @param {Date | string | null | undefined} value */
function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Khóa học có đang nhận đăng ký không (hỗ trợ chỉ mở, chỉ đóng, hoặc cả hai). */
export function isEnrollmentOpen(course, now = new Date()) {
  if (!course) return false;

  const open = toDate(course.enrollmentOpenDate);
  const close = toDate(course.enrollmentCloseDate);

  if (!open && !close) return true;
  if (open && now < open) return false;
  if (close && now > close) return false;
  return true;
}

export function formatEnrollmentDateTime(value) {
  return formatDateTimeVN(toDate(value));
}

/** Nhãn nút khi chưa mở đăng ký. */
export function getEnrollmentClosedButtonLabel(status) {
  return status?.badge === "Chưa mở" ? "Chưa mở đăng ký" : "Đã đóng đăng ký";
}

/** Trạng thái hiển thị công khai: Còn chỗ / Chưa mở / Đã đóng */
export function getEnrollmentStatus(course, now = new Date()) {
  const open = toDate(course?.enrollmentOpenDate);
  const close = toDate(course?.enrollmentCloseDate);
  const isOpen = isEnrollmentOpen(course, now);

  if (isOpen) {
    return {
      isOpen: true,
      badge: "Còn chỗ",
      badgeVariant: "open",
      message: close ? `Đóng đăng ký: ${formatEnrollmentDateTime(close)}` : null
    };
  }

  if (open && now < open) {
    return {
      isOpen: false,
      badge: "Chưa mở",
      badgeVariant: "pending",
      message: `Mở đăng ký: ${formatEnrollmentDateTime(open)}`
    };
  }

  return {
    isOpen: false,
    badge: "Đã đóng",
    badgeVariant: "closed",
    message: close
      ? `Đóng đăng ký: ${formatEnrollmentDateTime(close)}`
      : "Đã đóng đăng ký"
  };
}
