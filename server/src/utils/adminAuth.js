const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

/** Mặc định khi không đặt ADMIN_API_SECRET (chỉ phù hợp dev; production nên ghi đè bằng env). */
const DEFAULT_ADMIN_API_SECRET = "Quangpham@123";

function normalizeEmail(email) {
  return String(email || "")
    .toLowerCase()
    .trim();
}

function adminEmailsSet() {
  const raw = process.env.ADMIN_EMAILS || "pdquang050203@gmail.com";
  return new Set(
    raw
      .split(/[,;\s]+/)
      .map((s) => normalizeEmail(s))
      .filter(Boolean)
  );
}

function adminApiSecret() {
  const s = process.env.ADMIN_API_SECRET;
  if (s != null && String(s).length > 0) return String(s).trim();
  return DEFAULT_ADMIN_API_SECRET;
}

/** So khớp chuỗi bí mật (cùng độ dài) theo thời gian không phụ thuộc độ dài đúng. */
function timingSafeEqualString(a, b) {
  const aa = Buffer.from(String(a), "utf8");
  const bb = Buffer.from(String(b), "utf8");
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

/**
 * Xác thực quản trị viên từ body: adminEmail, adminPassword
 * — Mật khẩu đúng với User model, hoặc
 * — Khớp ADMIN_API_SECRET (dùng khi chỉ đăng nhập Google, không có mật khẩu trong DB).
 */
async function verifyAdminFromRequestBody(body) {
  const { adminEmail, adminPassword } = body || {};
  const em = normalizeEmail(adminEmail);
  if (!em || !adminPassword) {
    return { ok: false, status: 400, message: "Thiếu email hoặc mật khẩu quản trị." };
  }
  if (!adminEmailsSet().has(em)) {
    return { ok: false, status: 403, message: "Tài khoản không có quyền quản trị." };
  }
  const secret = adminApiSecret();
  const pwd = String(adminPassword);
  if (timingSafeEqualString(pwd, secret)) {
    return { ok: true, email: em };
  }
  const user = await User.findOne({ email: em });
  if (!user) {
    return {
      ok: false,
      status: 401,
      message:
        "Email quản trị chưa có tài khoản trong hệ thống. Nếu đăng nhập bằng Google: nhập đúng ADMIN_API_SECRET."
    };
  }
  if (!user.passwordHash || !(await bcrypt.compare(pwd, user.passwordHash))) {
    return { ok: false, status: 401, message: "Mật khẩu quản trị không đúng." };
  }
  return { ok: true, email: em };
}

module.exports = { normalizeEmail, adminEmailsSet, verifyAdminFromRequestBody };
