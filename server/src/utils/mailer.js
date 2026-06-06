const nodemailer = require("nodemailer");

const EMAIL_TIMEOUT_MS = 12_000;

function getSmtpConfig() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = String(process.env.SMTP_PASS || process.env.EMAIL_PASS || "").replace(/\s/g, "");
  if (!user || !pass) return null;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;

  if (host.includes("gmail.com") && !process.env.SMTP_HOST) {
    return {
      transport: { service: "gmail", auth: { user, pass } },
      from: process.env.SMTP_FROM || user
    };
  }

  return {
    transport: {
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: EMAIL_TIMEOUT_MS,
      greetingTimeout: EMAIL_TIMEOUT_MS,
      socketTimeout: EMAIL_TIMEOUT_MS
    },
    from: process.env.SMTP_FROM || user
  };
}

function getSenderEmail() {
  return (
    process.env.BREVO_FROM ||
    process.env.SENDGRID_FROM ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USER ||
    ""
  ).trim();
}

function getSenderName() {
  return process.env.BREVO_FROM_NAME || process.env.SENDGRID_FROM_NAME || "TZONE";
}

function buildResetEmailHtml(resetUrl) {
  return `
    <h2>Đặt lại mật khẩu</h2>
    <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới (có hiệu lực trong 1 giờ):</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
  `;
}

function buildResetEmailText(resetUrl) {
  return `Đặt lại mật khẩu TZONE\n\nLink (hiệu lực 1 giờ): ${resetUrl}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.`;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatVnd(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "0đ";
  return n.toLocaleString("vi-VN") + "đ";
}

function formatVnDateTime(date) {
  const d = date ? new Date(date) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const PAYMENT_METHOD_LABELS = {
  transfer: "Chuyển khoản ngân hàng"
};

function buildInvoiceHtml({ customerName, customerEmail, order, courses, appBaseUrl }) {
  const orderId = String(order._id);
  const orderCode = orderId.slice(-8).toUpperCase();
  const paidAt = formatVnDateTime(order.updatedAt || new Date());
  const methodLabel = PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod;

  const itemsHtml = courses
    .map((c, idx) => {
      const title = escapeHtml(c.title || "Khóa học");
      const instructor = escapeHtml(c.instructor || "—");
      const price = formatVnd(c.priceAtPurchase);
      return `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;text-align:center;">${idx + 1}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">
            <div style="font-weight:600;">${title}</div>
            <div style="color:#6b7280;font-size:13px;margin-top:2px;">Giảng viên: ${instructor}</div>
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;text-align:right;white-space:nowrap;">${price}</td>
        </tr>`;
    })
    .join("");

  const myCoursesUrl = `${appBaseUrl.replace(/\/$/, "")}/my-courses`;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Hóa đơn TZONE #${orderCode}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:32px 32px 24px;color:#ffffff;">
              <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.85;">TZONE Toeic</div>
              <h1 style="margin:8px 0 4px;font-size:24px;font-weight:700;">Hóa đơn thanh toán</h1>
              <div style="font-size:14px;opacity:0.9;">Cảm ơn bạn đã đăng ký khóa học!</div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:14px 16px;color:#065f46;font-size:14px;">
                <strong>Thanh toán đã được xác nhận.</strong> Bạn có thể vào học ngay trong mục "Khóa học của tôi".
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" style="padding-right:12px;vertical-align:top;">
                    <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Mã hóa đơn</div>
                    <div style="font-size:15px;color:#111827;font-weight:600;">#${orderCode}</div>
                  </td>
                  <td width="50%" style="padding-left:12px;vertical-align:top;">
                    <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Ngày thanh toán</div>
                    <div style="font-size:15px;color:#111827;font-weight:600;">${paidAt}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:16px;">
                    <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Khách hàng</div>
                    <div style="font-size:15px;color:#111827;font-weight:600;">${escapeHtml(customerName || customerEmail)}</div>
                    <div style="font-size:13px;color:#6b7280;margin-top:2px;">${escapeHtml(customerEmail)}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:16px;">
                    <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Phương thức thanh toán</div>
                    <div style="font-size:15px;color:#111827;font-weight:600;">${escapeHtml(methodLabel)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <h3 style="margin:0 0 12px;font-size:16px;color:#111827;">Chi tiết khóa học</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;overflow:hidden;">
                <thead>
                  <tr style="background:#f9fafb;">
                    <th style="padding:10px 8px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;width:40px;">#</th>
                    <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Khóa học</th>
                    <th style="padding:10px 8px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;">Học phí</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding:14px 8px;text-align:right;font-size:14px;color:#111827;font-weight:600;background:#f9fafb;">Tổng cộng</td>
                    <td style="padding:14px 8px;text-align:right;font-size:18px;color:#059669;font-weight:700;background:#f9fafb;white-space:nowrap;">${formatVnd(order.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px;">
              <a href="${myCoursesUrl}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">Vào học ngay →</a>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px;">
              <div style="border-top:1px solid #e5e7eb;padding-top:16px;font-size:12px;color:#6b7280;line-height:1.6;">
                Đây là email tự động xác nhận thanh toán từ TZONE Toeic. Nếu có vấn đề về thanh toán hoặc khóa học, vui lòng liên hệ qua kênh hỗ trợ chính thức của chúng tôi.<br/>
                <span style="color:#9ca3af;">© ${new Date().getFullYear()} TZONE Toeic</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildOrderRejectionHtml({ customerName, customerEmail, order, courses, cancelReason, appBaseUrl }) {
  const orderCode = String(order._id).slice(-8).toUpperCase();
  const rejectedAt = formatVnDateTime(order.updatedAt || new Date());
  const methodLabel = PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod;
  const reasonBlock = cancelReason
    ? `<div style="margin-top:12px;padding:12px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;color:#9a3412;font-size:14px;"><strong>Lý do:</strong> ${escapeHtml(cancelReason)}</div>`
    : "";

  const itemsHtml = courses
    .map((c, idx) => {
      const title = escapeHtml(c.title || "Khóa học");
      const price = formatVnd(c.priceAtPurchase);
      return `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;text-align:center;">${idx + 1}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;font-weight:600;">${title}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;text-align:right;white-space:nowrap;">${price}</td>
        </tr>`;
    })
    .join("");

  const cartUrl = `${appBaseUrl.replace(/\/$/, "")}/cart`;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Đơn hàng không được duyệt #${orderCode}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);padding:32px 32px 24px;color:#ffffff;">
              <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.85;">TZONE Toeic</div>
              <h1 style="margin:8px 0 4px;font-size:24px;font-weight:700;">Đơn hàng chưa được duyệt</h1>
              <div style="font-size:14px;opacity:0.9;">Ảnh minh chứng thanh toán chưa được chấp nhận</div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 16px;color:#991b1b;font-size:14px;line-height:1.6;">
                <strong>Đơn hàng #${orderCode}</strong> của bạn chưa được duyệt. Vui lòng kiểm tra lại ảnh chuyển khoản (đúng số tiền, đúng nội dung, rõ nét) và thực hiện thanh toán lại nếu cần.
                ${reasonBlock}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" style="padding-right:12px;vertical-align:top;">
                    <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Mã đơn hàng</div>
                    <div style="font-size:15px;color:#111827;font-weight:600;">#${orderCode}</div>
                  </td>
                  <td width="50%" style="padding-left:12px;vertical-align:top;">
                    <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Thời gian xử lý</div>
                    <div style="font-size:15px;color:#111827;font-weight:600;">${rejectedAt}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:16px;">
                    <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Học viên</div>
                    <div style="font-size:15px;color:#111827;font-weight:600;">${escapeHtml(customerName || customerEmail)}</div>
                    <div style="font-size:13px;color:#6b7280;margin-top:2px;">${escapeHtml(customerEmail)}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:16px;">
                    <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Phương thức thanh toán</div>
                    <div style="font-size:15px;color:#111827;font-weight:600;">${escapeHtml(methodLabel)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <h3 style="margin:0 0 12px;font-size:16px;color:#111827;">Khóa học trong đơn</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;overflow:hidden;">
                <thead>
                  <tr style="background:#f9fafb;">
                    <th style="padding:10px 8px;text-align:center;font-size:12px;color:#6b7280;width:40px;">#</th>
                    <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;">Khóa học</th>
                    <th style="padding:10px 8px;text-align:right;font-size:12px;color:#6b7280;">Học phí</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding:14px 8px;text-align:right;font-size:14px;font-weight:600;background:#f9fafb;">Tổng cộng</td>
                    <td style="padding:14px 8px;text-align:right;font-size:18px;color:#dc2626;font-weight:700;background:#f9fafb;">${formatVnd(order.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px;">
              <a href="${cartUrl}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">Xem giỏ hàng / thanh toán lại →</a>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px;">
              <div style="border-top:1px solid #e5e7eb;padding-top:16px;font-size:12px;color:#6b7280;line-height:1.6;">
                Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ bộ phận vận hành TZONE để được hỗ trợ.<br/>
                <span style="color:#9ca3af;">© ${new Date().getFullYear()} TZONE Toeic</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildOrderRejectionText({ customerName, customerEmail, order, courses, cancelReason }) {
  const orderCode = String(order._id).slice(-8).toUpperCase();
  const rejectedAt = formatVnDateTime(order.updatedAt || new Date());
  const lines = [
    "TZONE — Đơn hàng chưa được duyệt",
    "================================",
    `Mã đơn hàng: #${orderCode}`,
    `Thời gian xử lý: ${rejectedAt}`,
    `Học viên: ${customerName || customerEmail}`,
    `Email: ${customerEmail}`,
    "",
    "Ảnh minh chứng thanh toán chưa được chấp nhận. Vui lòng kiểm tra lại và thanh toán lại nếu cần.",
    ""
  ];
  if (cancelReason) {
    lines.push(`Lý do: ${cancelReason}`, "");
  }
  lines.push("Khóa học trong đơn:");
  courses.forEach((c, idx) => {
    lines.push(`  ${idx + 1}. ${c.title || "Khóa học"} — ${formatVnd(c.priceAtPurchase)}`);
  });
  lines.push("", `Tổng cộng: ${formatVnd(order.totalAmount)}`);
  return lines.join("\n");
}

function buildInvoiceText({ customerName, customerEmail, order, courses }) {
  const orderCode = String(order._id).slice(-8).toUpperCase();
  const paidAt = formatVnDateTime(order.updatedAt || new Date());
  const methodLabel = PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod;
  const lines = [
    "TZONE — Hóa đơn thanh toán",
    "============================",
    `Mã hóa đơn: #${orderCode}`,
    `Ngày thanh toán: ${paidAt}`,
    `Khách hàng: ${customerName || customerEmail}`,
    `Email: ${customerEmail}`,
    `Phương thức: ${methodLabel}`,
    "",
    "Chi tiết khóa học:"
  ];
  courses.forEach((c, idx) => {
    lines.push(`  ${idx + 1}. ${c.title || "Khóa học"} — ${formatVnd(c.priceAtPurchase)}`);
  });
  lines.push("");
  lines.push(`Tổng cộng: ${formatVnd(order.totalAmount)}`);
  lines.push("");
  lines.push("Cảm ơn bạn đã đăng ký khóa học tại TZONE!");
  return lines.join("\n");
}

function formatVnDate(date) {
  const d = date ? new Date(date) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function buildCertificateHtml({ studentName, courseTitle, instructorName, completedAt, certificateCode, appBaseUrl }) {
  const dateStr = formatVnDate(completedAt);
  const myCoursesUrl = `${(appBaseUrl || "").replace(/\/$/, "")}/my-courses`;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Giấy chứng nhận hoàn thành khóa học</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f7;padding:28px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:6px;background:linear-gradient(135deg,#10b981 0%,#059669 100%);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:10px;">
                <tr>
                  <td style="padding:40px 48px;text-align:center;border:2px solid #d1fae5;border-radius:10px;">
                    <div style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#059669;font-weight:700;">TZONE Toeic</div>
                    <h1 style="margin:18px 0 4px;font-size:28px;font-weight:800;color:#111827;letter-spacing:0.5px;">GIẤY CHỨNG NHẬN</h1>
                    <div style="font-size:15px;color:#6b7280;">Hoàn thành khóa học</div>

                    <div style="margin:28px 0 6px;font-size:14px;color:#6b7280;">Chứng nhận học viên</div>
                    <div style="font-size:26px;font-weight:800;color:#059669;">${escapeHtml(studentName)}</div>

                    <div style="margin:24px auto 0;max-width:440px;font-size:15px;color:#374151;line-height:1.7;">
                      đã hoàn thành khóa học
                      <div style="margin-top:10px;font-size:19px;font-weight:700;color:#111827;">“${escapeHtml(courseTitle)}”</div>
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:32px;">
                      <tr>
                        <td width="50%" style="text-align:center;vertical-align:top;">
                          <div style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Giảng viên</div>
                          <div style="font-size:15px;color:#111827;font-weight:600;margin-top:4px;">${escapeHtml(instructorName || "—")}</div>
                        </td>
                        <td width="50%" style="text-align:center;vertical-align:top;">
                          <div style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Ngày hoàn thành</div>
                          <div style="font-size:15px;color:#111827;font-weight:600;margin-top:4px;">${escapeHtml(dateStr)}</div>
                        </td>
                      </tr>
                    </table>

                    <div style="margin-top:28px;font-size:12px;color:#9ca3af;">Mã chứng nhận: <span style="font-weight:600;color:#6b7280;">${escapeHtml(certificateCode)}</span></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 48px;text-align:center;">
              <a href="${myCoursesUrl}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:8px;font-weight:600;font-size:14px;">Xem khóa học của tôi →</a>
              <div style="margin-top:18px;font-size:12px;color:#9ca3af;line-height:1.6;">
                Bạn có thể lưu hoặc in email này (in ra PDF) để giữ làm giấy chứng nhận.<br/>
                © ${new Date().getFullYear()} TZONE Toeic
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildCertificateText({ studentName, courseTitle, instructorName, completedAt, certificateCode }) {
  return [
    "TZONE — GIẤY CHỨNG NHẬN HOÀN THÀNH KHÓA HỌC",
    "============================================",
    `Học viên: ${studentName}`,
    `Khóa học: ${courseTitle}`,
    `Giảng viên: ${instructorName || "—"}`,
    `Ngày hoàn thành: ${formatVnDateTime(completedAt || new Date())}`,
    `Mã chứng nhận: ${certificateCode}`,
    "",
    "Chúc mừng bạn đã hoàn thành khóa học!"
  ].join("\n");
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} quá thời gian chờ (${ms}ms)`)), ms);
    })
  ]);
}

async function sendViaBrevo(to, subject, html, text) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  const fromEmail = getSenderEmail();
  if (!fromEmail) {
    throw new Error("Thiếu BREVO_FROM hoặc EMAIL_USER (email đã verify trên Brevo).");
  }

  const res = await withTimeout(
    fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify({
        sender: { name: getSenderName(), email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text
      })
    }),
    EMAIL_TIMEOUT_MS,
    "Brevo API"
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo ${res.status}: ${body || res.statusText}`);
  }

  console.log(`[mailer] Brevo: đã gửi email tới ${to}`);
  return true;
}

async function sendViaSendGrid(to, subject, html, text) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return false;

  const fromEmail = getSenderEmail();
  if (!fromEmail) {
    throw new Error("Thiếu SENDGRID_FROM hoặc EMAIL_USER (email đã verify trên SendGrid).");
  }

  const res = await withTimeout(
    fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: fromEmail, name: getSenderName() },
        subject,
        content: [
          { type: "text/plain", value: text },
          { type: "text/html", value: html }
        ]
      })
    }),
    EMAIL_TIMEOUT_MS,
    "SendGrid API"
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`SendGrid ${res.status}: ${body || res.statusText}`);
  }

  console.log(`[mailer] SendGrid: đã gửi email tới ${to}`);
  return true;
}

async function sendViaResend(to, subject, html) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.RESEND_FROM || "TZONE <onboarding@resend.dev>";
  const res = await withTimeout(
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from, to, subject, html })
    }),
    EMAIL_TIMEOUT_MS,
    "Resend API"
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${body || res.statusText}`);
  }

  console.log(`[mailer] Resend: đã gửi email tới ${to}`);
  return true;
}

async function sendViaSmtp(to, subject, html, text) {
  const smtp = getSmtpConfig();
  if (!smtp) return false;

  const transporter = nodemailer.createTransport({
    ...smtp.transport,
    connectionTimeout: EMAIL_TIMEOUT_MS,
    greetingTimeout: EMAIL_TIMEOUT_MS,
    socketTimeout: EMAIL_TIMEOUT_MS
  });

  await withTimeout(
    transporter.sendMail({ from: smtp.from, to, subject, text, html }),
    EMAIL_TIMEOUT_MS,
    "SMTP"
  );

  console.log(`[mailer] SMTP: đã gửi email tới ${to}`);
  return true;
}

function getActiveProviders() {
  const list = [];
  if (process.env.BREVO_API_KEY) list.push("Brevo");
  if (process.env.SENDGRID_API_KEY) list.push("SendGrid");
  if (process.env.RESEND_API_KEY) list.push("Resend");
  if (getSmtpConfig() && !process.env.RENDER) list.push("SMTP");
  return list;
}

/** Gửi email qua các provider theo thứ tự ưu tiên. */
async function sendEmail({ to, subject, html, text }) {
  const safeText = text || subject;
  try {
    if (process.env.BREVO_API_KEY) {
      const sent = await sendViaBrevo(to, subject, html, safeText);
      if (sent) return true;
    }
    if (process.env.SENDGRID_API_KEY) {
      const sent = await sendViaSendGrid(to, subject, html, safeText);
      if (sent) return true;
    }
    if (process.env.RESEND_API_KEY) {
      const sent = await sendViaResend(to, subject, html);
      if (sent) return true;
    }
    if (process.env.RENDER) {
      console.warn("[mailer] Render chặn SMTP. Cần BREVO_API_KEY hoặc SENDGRID_API_KEY.");
      return false;
    }
    return await sendViaSmtp(to, subject, html, safeText);
  } catch (err) {
    console.error(`[mailer] Gửi email "${subject}" thất bại:`, err.message);
    return false;
  }
}

async function sendResetPasswordEmail(to, resetUrl) {
  const subject = "TZONE Toeic — Đặt lại mật khẩu";
  const html = buildResetEmailHtml(resetUrl);
  const text = buildResetEmailText(resetUrl);

  console.log(`[mailer] Gửi reset password → ${to} | providers: ${getActiveProviders().join(", ") || "none"}`);

  const sent = await sendEmail({ to, subject, html, text });
  if (!sent) {
    console.warn("[mailer] Reset URL (fallback):", resetUrl);
  }
  return sent;
}

/**
 * Gửi hóa đơn xác nhận thanh toán sau khi admin duyệt đơn.
 * @param {string} to Email người nhận.
 * @param {object} payload { customerName, order, courses, appBaseUrl }
 *   - order: { _id, totalAmount, paymentMethod, updatedAt }
 *   - courses: Array<{ title, instructor, priceAtPurchase }>
 */
/**
 * Gửi email thông báo đơn hàng bị từ chối (minh chứng không được duyệt).
 * @param {string} to Email người nhận.
 * @param {object} payload { customerName, order, courses, cancelReason, appBaseUrl }
 */
async function sendOrderRejectionEmail(to, payload) {
  const appBaseUrl =
    payload.appBaseUrl || process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:5173";
  const orderCode = String(payload.order._id).slice(-8).toUpperCase();
  const subject = `TZONE Toeic — Đơn hàng #${orderCode} chưa được duyệt`;
  const html = buildOrderRejectionHtml({ ...payload, customerEmail: to, appBaseUrl });
  const text = buildOrderRejectionText({ ...payload, customerEmail: to });

  console.log(`[mailer] Gửi thông báo từ chối đơn → ${to} | providers: ${getActiveProviders().join(", ") || "none"}`);
  return sendEmail({ to, subject, html, text });
}

async function sendOrderConfirmationEmail(to, payload) {
  const appBaseUrl =
    payload.appBaseUrl || process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:5173";
  const orderCode = String(payload.order._id).slice(-8).toUpperCase();
  const subject = `TZONE Toeic — Hóa đơn thanh toán #${orderCode}`;
  const html = buildInvoiceHtml({ ...payload, customerEmail: to, appBaseUrl });
  const text = buildInvoiceText({ ...payload, customerEmail: to });

  console.log(`[mailer] Gửi hóa đơn → ${to} | providers: ${getActiveProviders().join(", ") || "none"}`);
  return sendEmail({ to, subject, html, text });
}

/**
 * Gửi giấy chứng nhận hoàn thành khóa học (khi học viên đạt 100% tiến độ).
 * @param {string} to Email người nhận.
 * @param {object} payload { studentName, courseTitle, instructorName, completedAt, certificateCode, appBaseUrl }
 */
async function sendCourseCertificateEmail(to, payload) {
  const appBaseUrl =
    payload.appBaseUrl || process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:5173";
  const subject = `TZONE Toeic — Giấy chứng nhận hoàn thành: ${payload.courseTitle}`;
  const html = buildCertificateHtml({ ...payload, appBaseUrl });
  const text = buildCertificateText(payload);

  console.log(`[mailer] Gửi giấy chứng nhận → ${to} | providers: ${getActiveProviders().join(", ") || "none"}`);
  return sendEmail({ to, subject, html, text });
}

module.exports = {
  sendResetPasswordEmail,
  sendOrderRejectionEmail,
  sendOrderConfirmationEmail,
  sendCourseCertificateEmail,
  sendEmail,
  getSmtpConfig,
  getActiveProviders
};
