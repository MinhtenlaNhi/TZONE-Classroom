const express = require("express");
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

// LƯU Ý: Router này được mount tại "/api/admin" (cùng cấp với orders/reviews/categories...).
// Không dùng router.use(isAdmin) chung vì nó sẽ chặn TẤT CẢ request /api/admin/* (kể cả các
// route thuộc router khác như đơn hàng, đánh giá) trước khi chúng kịp đi tới đúng router.
// Vì vậy phải gắn middleware bảo vệ cho TỪNG route cụ thể bên dưới.

/** Danh sách giáo viên chờ duyệt */
router.get("/pending-teachers", authMiddleware, isAdmin, async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const rows = await User.find({
      role: "teacher",
      $or: [
        { teacherApprovalStatus: "pending" },
        { teacherApprovalStatus: null },
        { teacherApprovalStatus: { $exists: false } }
      ]
    })
      .sort({ createdAt: 1 })
      .select("email name teacherApprovalStatus createdAt")
      .lean();
    return res.json({ success: true, teachers: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/** Tất cả giáo viên (để admin xem trạng thái) */
router.get("/teachers", authMiddleware, isAdmin, async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const rows = await User.find({ role: "teacher" })
      .sort({ updatedAt: -1 })
      .select("email name teacherApprovalStatus teacherCode createdAt updatedAt")
      .lean();
    return res.json({ success: true, teachers: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

router.post("/approve-teacher", authMiddleware, isAdmin, async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const teacherEmail = normalizeEmail(req.body?.teacherEmail);
    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: "Thiếu email giáo viên." });
    }
    const user = await User.findOne({ email: teacherEmail, role: "teacher" });
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản giáo viên." });
    }
    user.teacherApprovalStatus = "approved";
    await ensureTeacherHasCode(user);
    await user.save();
    return res.json({
      success: true,
      message: "Đã phê duyệt tài khoản giáo viên.",
      teacherCode: user.teacherCode || null
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

router.post("/reject-teacher", authMiddleware, isAdmin, async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const teacherEmail = normalizeEmail(req.body?.teacherEmail);
    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: "Thiếu email giáo viên." });
    }
    const user = await User.findOne({ email: teacherEmail, role: "teacher" });
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản giáo viên." });
    }
    user.teacherApprovalStatus = "rejected";
    await user.save();
    return res.json({ success: true, message: "Đã từ chối tài khoản giáo viên." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

module.exports = router;
