const express = require("express");
const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const Review = require("../models/Review");
const { authMiddleware } = require("../middlewares/auth");
const { isEnrollmentOpen } = require("../utils/enrollment");
const { buildCurriculum } = require("../utils/lessonHelpers");
const { attachCoursesToEnrollments } = require("../utils/enrollmentHelpers");
const { seedCurriculumForCourse } = require("../utils/courseCurriculum");
const { sendCourseCertificateEmail } = require("../utils/mailer");

const router = express.Router();

/** URL gốc của ứng dụng (cho link trong email). */
function getAppBaseUrl(req) {
  return (
    process.env.APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (req ? `${req.protocol}://${req.get("host")}` : "http://localhost:5173")
  );
}

/** Mã giấy chứng nhận, vd: TZONE-2026-AB12CD. */
function buildCertificateCode(enrollment) {
  const year = new Date(enrollment.completedAt || Date.now()).getFullYear();
  const suffix = String(enrollment._id).slice(-6).toUpperCase();
  return `TZONE-${year}-${suffix}`;
}

// Helper: tìm Course bằng param courseId (hỗ trợ cả ObjectId và string id)
async function findCourse(courseId) {
  return Course.findOne({
    $or: [{ _id: courseId.match(/^[0-9a-fA-F]{24}$/) ? courseId : null }, { id: courseId }]
  });
}

// 1. Lấy danh sách khóa học user đang tham gia
router.get("/", authMiddleware, async (req, res) => {
  try {
    const rows = await Enrollment.find({ user: req.user._id }).sort({ enrolledAt: -1 }).lean();
    const enrollments = await attachCoursesToEnrollments(rows);

    return res.json({ success: true, enrollments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy danh sách khóa học." });
  }
});

// 2. Lấy lộ trình bài học của một khóa học đã đăng ký
router.get("/:courseId/lessons", authMiddleware, async (req, res) => {
  try {
    const course = await findCourse(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học." });
    }

    // Tìm enrollment
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id }).populate("course", "title");
    if (!enrollment) {
      return res.status(403).json({ success: false, message: "Bạn chưa đăng ký khóa học này." });
    }

    // Tự động tạo lộ trình cố định nếu khóa thuộc danh mục có template (vd: tap-su) mà chưa có bài học.
    try {
      await seedCurriculumForCourse(course);
    } catch (seedErr) {
      console.error("[enrollments] Tạo lộ trình mặc định thất bại:", seedErr.message);
    }

    // Lấy bài học. Học thử vẫn xem được TOÀN BỘ danh sách bài học,
    // nhưng các bài không được giáo viên đánh dấu "học thử" (isFreePreview)
    // sẽ bị khóa nội dung (chỉ còn tiêu đề để hiển thị).
    const query = { courseRef: course._id, isSectionPlaceholder: { $ne: true } };
    const lessons = await Lesson.find(query).sort({ sectionIndex: 1, order: 1 }).lean();
    let curriculum = buildCurriculum(lessons);

    if (enrollment.isTrial) {
      curriculum = curriculum.map((section) => ({
        ...section,
        lessons: section.lessons.map((lesson) => {
          if (lesson.isFreePreview) return lesson;
          // Bài bị khóa: chỉ trả về thông tin tối thiểu, ẩn nội dung nhạy cảm
          // (link Meet, tài liệu, ngày học, bài tập...).
          return {
            _id: lesson._id,
            sectionIndex: lesson.sectionIndex,
            sectionTitle: lesson.sectionTitle,
            order: lesson.order,
            title: lesson.title,
            isFreePreview: false,
            locked: true,
            materials: [],
            assignments: []
          };
        })
      }));
    }

    const hasReviewed = !!(await Review.exists({ courseRef: course._id, userRef: req.user._id }));

    return res.json({
      success: true, 
      courseTitle: enrollment.course?.title,
      isTrial: enrollment.isTrial,
      progress: enrollment.progress,
      hasReviewed,
      curriculum 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi khi tải lộ trình học." });
  }
});

// 3. Cập nhật tiến độ học tập
router.put("/:courseId/progress", authMiddleware, async (req, res) => {
  try {
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({ success: false, message: "Tiến độ không hợp lệ." });
    }

    const course = await findCourse(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học." });
    }

    const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học đang học." });
    }

    // Chỉ cập nhật nếu progress mới lớn hơn (hoặc do học sinh tự kéo lại)
    enrollment.progress = progress;

    // Cấp giấy chứng nhận khi hoàn thành 100% (chỉ cho học viên đã đăng ký,
    // không áp dụng học thử) và chưa từng được cấp trước đó.
    let certificateIssued = false;
    if (progress >= 100 && !enrollment.isTrial && !enrollment.certificateIssuedAt) {
      const now = new Date();
      if (!enrollment.completedAt) enrollment.completedAt = now;
      enrollment.certificateIssuedAt = now;
      certificateIssued = true;
    }

    await enrollment.save();

    if (certificateIssued && req.user.email) {
      // Gửi email bất đồng bộ — không chặn response.
      // Nếu gửi thất bại, bỏ đánh dấu để lần đạt 100% sau có thể thử gửi lại.
      const enrollmentId = enrollment._id;
      sendCourseCertificateEmail(req.user.email, {
        studentName: req.user.name || req.user.email,
        courseTitle: course.title,
        instructorName: course.instructor,
        completedAt: enrollment.completedAt,
        certificateCode: buildCertificateCode(enrollment),
        appBaseUrl: getAppBaseUrl(req)
      })
        .then((sent) => {
          if (!sent) {
            return Enrollment.updateOne({ _id: enrollmentId }, { $set: { certificateIssuedAt: null } });
          }
        })
        .catch((err) => {
          console.error("[enrollments] Gửi giấy chứng nhận thất bại:", err.message);
          Enrollment.updateOne({ _id: enrollmentId }, { $set: { certificateIssuedAt: null } }).catch(() => {});
        });
    }

    return res.json({ success: true, progress: enrollment.progress, certificateIssued });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi cập nhật tiến độ." });
  }
});

// 4. Đăng ký học thử (Trial Enrollment)
router.post("/course/:courseId/trial", authMiddleware, async (req, res) => {
  try {
    const course = await findCourse(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học." });
    }

    if (!isEnrollmentOpen(course)) {
      return res.status(400).json({ success: false, message: "Khóa học hiện không nhận đăng ký học thử." });
    }

    // Kiểm tra xem đã đăng ký khóa này chưa (cả trial lẫn chính thức)
    const existing = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (existing) {
      return res.status(400).json({ success: false, message: "Bạn đã đăng ký khóa học này rồi." });
    }

    // Tạo Enrollment trial
    const newEnrollment = new Enrollment({
      user: req.user._id,
      course: course._id,
      isTrial: true,
      progress: 0
    });

    await newEnrollment.save();

    return res.json({ success: true, message: "Đăng ký học thử thành công!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi đăng ký học thử." });
  }
});

module.exports = router;
