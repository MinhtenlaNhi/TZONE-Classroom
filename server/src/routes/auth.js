const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { isDbReady } = require("../db");
const { generateToken } = require("../utils/jwt");
const { sendResetPasswordEmail } = require("../utils/mailer");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

function dbUnavailable(res) {
  return res.status(503).json({
    success: false,
    message: "Cơ sở dữ liệu chưa sẵn sàng. Cấu hình MONGODB_URI trên server."
  });
}

function getAppBaseUrl(req) {
  const configured =
    process.env.APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    req.headers.origin ||
    "http://localhost:5173";
  return String(configured).replace(/\/$/, "");
}

/* ───────────────────────── CHECK EMAIL ───────────────────────── */

router.post("/check-email", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      return res.status(400).json({ success: false, message: "Thiếu email." });
    }
    const user = await User.findOne({ email });
    if (user && user.authProvider === "google") {
      return res.json({
        success: true,
        allowed: false,
        reason: "google_exists",
        message: "Email này đã được dùng với tài khoản Google. Vui lòng đăng nhập bằng Google hoặc dùng email khác."
      });
    }
    if (user) {
      return res.json({
        success: true,
        allowed: false,
        reason: "already_registered",
        message: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác."
      });
    }
    return res.json({ success: true, allowed: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/* ───────────────────────── LOGIN ───────────────────────── */

router.post("/login", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const { email, password } = req.body || {};
    const em = normalizeEmail(email);
    if (!em || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập email và mật khẩu." });
    }
    const user = await User.findOne({ email: em });
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng. Nếu bạn đăng ký bằng Google, hãy dùng \"Đăng nhập với Google\"."
      });
    }
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên."
      });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng." });
    }
    if (user.role === "teacher" && user.teacherApprovalStatus === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản giáo viên của bạn chưa được chấp nhận. Vui lòng liên hệ quản trị viên."
      });
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        authProvider: user.authProvider,
        accountRole: user.role,
        teacherApprovalStatus: user.role === "teacher" ? (user.teacherApprovalStatus || "approved") : undefined
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/* ───────────────────────── REGISTER ───────────────────────── */

router.post("/register", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const { email, name, password, role } = req.body || {};
    const em = normalizeEmail(email);
    const nameTrim = String(name || "").trim();
    if (!em || !nameTrim || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đủ thông tin." });
    }
    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({ success: false, message: "Vai trò không hợp lệ." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Mật khẩu cần ít nhất 6 ký tự." });
    }

    const existing = await User.findOne({ email: em });
    if (existing && existing.authProvider === "google") {
      return res.status(409).json({
        success: false,
        code: "GOOGLE_EMAIL",
        message: "Email này trùng với tài khoản Google. Vui lòng đăng nhập bằng Google hoặc chọn email khác."
      });
    }
    if (existing) {
      return res.status(409).json({
        success: false,
        code: "REGISTERED",
        message: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: em,
      name: nameTrim,
      passwordHash,
      authProvider: "local",
      role,
      teacherApprovalStatus: role === "teacher" ? "pending" : undefined
    });

    const token = generateToken(user);
    return res.json({
      success: true,
      message: "Đăng ký thành công.",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        authProvider: user.authProvider,
        accountRole: user.role,
        teacherApprovalStatus: user.role === "teacher" ? user.teacherApprovalStatus : undefined
      }
    });
  } catch (e) {
    console.error(e);
    if (e.code === 11000) {
      return res.status(409).json({ success: false, message: "Email đã tồn tại." });
    }
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/* ───────────────────────── GOOGLE SYNC ───────────────────────── */

router.post("/google-sync", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const { email, name, picture } = req.body || {};
    const em = normalizeEmail(email);
    if (!em) {
      return res.status(400).json({ success: false, message: "Thiếu email." });
    }

    const local = await User.findOne({ email: em, authProvider: "local" });
    if (local) {
      return res.status(409).json({
        success: false,
        code: "LOCAL_EMAIL_EXISTS",
        message: "Email này đã được đăng ký bằng mật khẩu. Vui lòng đăng nhập bằng email và mật khẩu."
      });
    }

    const user = await User.findOneAndUpdate(
      { email: em },
      {
        $set: {
          name: String(name || "").trim(),
          googlePicture: String(picture || "").trim(),
          authProvider: "google"
        },
        $setOnInsert: {
          email: em,
          role: "student"
        }
      },
      { upsert: true, new: true }
    );

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên."
      });
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || user.googlePicture,
        role: user.role,
        authProvider: user.authProvider
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/* ───────────────────────── FORGOT PASSWORD ───────────────────────── */

router.post("/forgot-password", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập email." });
    }

    const user = await User.findOne({ email, authProvider: "local" }).maxTimeMS(10_000);
    if (!user) {
      return res.json({ success: true, message: "Nếu email tồn tại, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ maxTimeMS: 10_000 });

    const resetUrl = `${getAppBaseUrl(req)}/reset-password/${resetToken}`;
    console.log(`[forgot-password] Reset URL for ${email}: ${resetUrl}`);

    // Trả response ngay — email chạy nền (Render chặn SMTP, tránh treo UI)
    res.json({
      success: true,
      message: "Nếu email tồn tại, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu."
    });

    setImmediate(() => {
      sendResetPasswordEmail(email, resetUrl).catch((emailErr) => {
        console.error("[forgot-password] Email send error:", emailErr.message);
      });
    });
    return;
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/* ───────────────────────── RESET PASSWORD ───────────────────────── */

router.post("/reset-password", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Thiếu token hoặc mật khẩu mới." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Mật khẩu cần ít nhất 6 ký tự." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ success: true, message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/* ───────────────────────── CHANGE PASSWORD ───────────────────────── */

router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Mật khẩu mới cần ít nhất 6 ký tự." });
    }

    const user = req.user;
    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản này đăng nhập bằng Google, không có mật khẩu để đổi."
      });
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: "Mật khẩu hiện tại không đúng." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ success: true, message: "Đổi mật khẩu thành công." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/* ───────────────────────── GET CURRENT USER ───────────────────────── */

router.get("/me", authMiddleware, async (req, res) => {
  try {
    return res.json({ success: true, user: req.user.toSafeObject() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

module.exports = router;
