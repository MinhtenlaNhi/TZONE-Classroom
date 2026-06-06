const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { isDbReady } = require("../db");
const { authMiddleware } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/role");
const { ensureTeacherHasCode } = require("../utils/teacherCode");

const router = express.Router();

function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

function dbUnavailable(res) {
  return res.status(503).json({ success: false, message: "Cơ sở dữ liệu chưa sẵn sàng." });
}

function toTeacherDto(user) {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    phone: user.phone || "",
    teacherCode: user.teacherCode || "",
    isBlocked: Boolean(user.isBlocked),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

/** Danh sách giáo viên */
router.get("/teachers", authMiddleware, isAdmin, async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const rows = await User.find({ role: "teacher" })
      .sort({ updatedAt: -1 })
      .select("email name phone teacherCode isBlocked createdAt updatedAt")
      .lean();
    return res.json({ success: true, teachers: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/** Tạo tài khoản giáo viên (admin) */
router.post("/teachers", authMiddleware, isAdmin, async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const { name, email, password, phone } = req.body || {};
    const em = normalizeEmail(email);
    const nameTrim = String(name || "").trim();
    const phoneTrim = String(phone || "").trim();

    if (!em || !nameTrim || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đủ tên, email và mật khẩu." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Mật khẩu cần ít nhất 6 ký tự." });
    }

    const existing = await User.findOne({ email: em });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email đã tồn tại." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: em,
      name: nameTrim,
      phone: phoneTrim,
      passwordHash,
      authProvider: "local",
      role: "teacher",
      teacherApprovalStatus: "approved"
    });
    await ensureTeacherHasCode(user);
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Đã tạo tài khoản giáo viên.",
      teacher: toTeacherDto(user)
    });
  } catch (e) {
    console.error(e);
    if (e.code === 11000) {
      return res.status(409).json({ success: false, message: "Email hoặc mã giáo viên đã tồn tại." });
    }
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/** Cập nhật giáo viên */
router.put("/teachers/:id", authMiddleware, isAdmin, async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const { name, email, password, phone } = req.body || {};
    const user = await User.findOne({ _id: req.params.id, role: "teacher" });
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giáo viên." });
    }

    if (email) {
      const em = normalizeEmail(email);
      if (em !== user.email) {
        const dup = await User.findOne({ email: em });
        if (dup) {
          return res.status(409).json({ success: false, message: "Email đã được sử dụng." });
        }
        user.email = em;
      }
    }

    if (name) user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone || "").trim();
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Mật khẩu cần ít nhất 6 ký tự." });
      }
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    user.teacherApprovalStatus = "approved";
    await ensureTeacherHasCode(user);
    await user.save();

    return res.json({
      success: true,
      message: "Đã cập nhật giáo viên.",
      teacher: toTeacherDto(user)
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

module.exports = router;
