const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Course = require("../models/Course");
const CourseSessionLink = require("../models/CourseSessionLink");
const { isDbReady } = require("../db");

const router = express.Router();

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

function isTeacherApprovedForTools(user) {
  if (user.role !== "teacher") return false;
  const s = user.teacherApprovalStatus;
  if (s === "pending" || s === "rejected") return false;
  return true;
}

function canManageLinks(user) {
  if (!user) return false;
  if (user.role === "teacher") return isTeacherApprovedForTools(user);
  return adminEmailsSet().has(normalizeEmail(user.email));
}

function dbUnavailable(res) {
  return res.status(503).json({
    success: false,
    message: "Cơ sở dữ liệu chưa sẵn sàng."
  });
}

async function findCourseByParam(courseId) {
  const raw = String(courseId || "").trim();
  if (!raw) return null;
  if (raw.match(/^[0-9a-fA-F]{24}$/)) {
    return Course.findOne({ $or: [{ _id: raw }, { id: raw }] })
      .select("id meetUrl updatedAt")
      .lean();
  }
  return Course.findOne({ id: raw }).select("id meetUrl updatedAt").lean();
}

/** Lấy link khóa học — ưu tiên Course.meetUrl, fallback bản ghi cũ theo thứ. */
async function resolveCourseMeetUrl(course) {
  if (!course) return { meetUrl: "", updatedAt: null };

  if (course.meetUrl && String(course.meetUrl).trim()) {
    return { meetUrl: String(course.meetUrl).trim(), updatedAt: course.updatedAt };
  }

  const legacy = await CourseSessionLink.findOne({
    courseId: course.id,
    meetUrl: { $regex: /\S/ }
  })
    .sort({ updatedAt: -1 })
    .lean();

  if (legacy?.meetUrl) {
    return { meetUrl: String(legacy.meetUrl).trim(), updatedAt: legacy.updatedAt };
  }

  return { meetUrl: "", updatedAt: null };
}

/** Học viên / công khai: lấy link theo khóa */
router.get("/:courseId", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const course = await findCourseByParam(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học." });
    }

    const { meetUrl, updatedAt } = await resolveCourseMeetUrl(course);
    return res.json({ success: true, meetUrl, updatedAt });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/**
 * Giáo viên / admin: cập nhật link cố định cho cả khóa học.
 * Body: { email, password, meetUrl }
 */
router.put("/:courseId", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const courseId = String(req.params.courseId || "").trim();
    const { email, password, meetUrl } = req.body || {};
    const em = normalizeEmail(email);
    const url = String(meetUrl || "").trim();

    if (!courseId || !em || !password) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin đăng nhập hoặc mã khóa." });
    }
    if (url && !/^https?:\/\//i.test(url)) {
      return res.status(400).json({ success: false, message: "Link phải bắt đầu bằng http:// hoặc https://" });
    }

    const user = await User.findOne({ email: em });
    if (!user) {
      return res.status(401).json({ success: false, message: "Mật khẩu không đúng." });
    }
    if (!user.passwordHash || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Mật khẩu không đúng." });
    }
    if (!canManageLinks(user)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ giáo viên hoặc quản trị viên được cập nhật link lớp học."
      });
    }

    const course = await findCourseByParam(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học." });
    }

    await Course.updateOne({ _id: course._id }, { $set: { meetUrl: url } });

    return res.json({
      success: true,
      meetUrl: url,
      updatedAt: new Date()
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

module.exports = router;
