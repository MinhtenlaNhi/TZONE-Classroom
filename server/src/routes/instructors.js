const express = require("express");
const User = require("../models/User");
const { isDbReady } = require("../db");
const { generateUniqueTeacherCode } = require("../utils/teacherCode");

const router = express.Router();

const APPROVED_TEACHER_FILTER = {
  role: "teacher",
  $nor: [{ teacherApprovalStatus: "pending" }, { teacherApprovalStatus: "rejected" }]
};

/**
 * Công khai: danh sách giảng viên đã duyệt + mã (CTxxxx) để gán khóa học, không cần đăng nhập admin.
 */
router.get("/", async (req, res) => {
  if (!isDbReady()) {
    return res.json({ success: true, instructors: [] });
  }
  try {
    const rows = await User.find(APPROVED_TEACHER_FILTER).sort({ name: 1 }).lean();

    const instructors = [];
    for (const r of rows) {
      let code = r.teacherCode && String(r.teacherCode).trim();
      if (!code) {
        const newCode = await generateUniqueTeacherCode();
        let updated = await User.findOneAndUpdate(
          {
            _id: r._id,
            $or: [{ teacherCode: { $exists: false } }, { teacherCode: null }, { teacherCode: "" }]
          },
          { $set: { teacherCode: newCode } },
          { new: true, select: "teacherCode" }
        ).lean();
        if (!updated) {
          const again = await User.findById(r._id).select("teacherCode").lean();
          code = again?.teacherCode && String(again.teacherCode).trim();
        } else {
          code = updated.teacherCode;
        }
        if (!code) code = newCode;
      }
      const name = String(r.name || "").trim() || r.email;
      instructors.push({
        id: r._id,
        teacherCode: code,
        name,
        display: `${code} - ${name}`,
        avatar: r.avatar
      });
    }

    return res.json({ success: true, instructors });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ.", instructors: [] });
  }
});

module.exports = router;
