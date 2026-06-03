const express = require("express");
const Review = require("../models/Review");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

const mongoose = require("mongoose");

// Helper: Tính lại rating trung bình và cập nhật vào Course
const updateCourseRating = async (courseId) => {
  try {
    const objectId = new mongoose.Types.ObjectId(courseId);
    const result = await Review.aggregate([
      { $match: { courseRef: objectId, isHidden: false } },
      { $group: { _id: "$courseRef", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    if (result.length > 0) {
      const { avgRating, count } = result[0];
      await Course.findByIdAndUpdate(courseId, { rating: Number(avgRating.toFixed(1)), reviewCount: count });
    } else {
      await Course.findByIdAndUpdate(courseId, { rating: 0, reviewCount: 0 });
    }
  } catch (err) {
    console.error("Error updating course rating:", err);
  }
};

// 0. Lấy các review mới nhất cho trang chủ
router.get("/latest", async (req, res) => {
  try {
    const reviews = await Review.find({ isHidden: false })
      .populate("userRef", "name avatar googlePicture")
      .populate("courseRef", "title id startDate")
      .sort({ rating: -1, createdAt: -1 })
      .limit(6)
      .lean();

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 1. Lấy danh sách reviews công khai của khóa học
router.get("/course/:courseId", async (req, res) => {
  try {
    let courseRefId = req.params.courseId;

    // Nếu courseId không phải là ObjectId (ví dụ: là slug "toeic-b-tb03")
    if (!courseRefId.match(/^[0-9a-fA-F]{24}$/)) {
      const course = await Course.findOne({ id: courseRefId }).select("_id").lean();
      if (!course) {
        return res.json({ success: true, reviews: [] });
      }
      courseRefId = course._id;
    }

    const reviews = await Review.find({ courseRef: courseRefId, isHidden: false })
      .populate("userRef", "name avatar")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 1.5. Lấy danh sách đánh giá của tôi (user đang đăng nhập)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ userRef: req.user._id })
      .populate("courseRef", "title thumbnail")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi khi tải đánh giá của bạn" });
  }
});

// 2. Viết / Cập nhật đánh giá
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Số sao không hợp lệ." });
    }

    // Kiểm tra xem user có phải học sinh của khóa không (và không phải Trial)
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!enrollment || enrollment.isTrial) {
      return res.status(403).json({ success: false, message: "Chỉ học viên chính thức mới có thể viết đánh giá." });
    }

    // Chỉ cho đánh giá khi đã hoàn thành 100% lộ trình.
    if (enrollment.progress < 100) {
      return res.status(403).json({
        success: false,
        message: "Bạn cần hoàn thành 100% khóa học để có thể đánh giá."
      });
    }

    // Mỗi học viên chỉ được đánh giá 1 lần duy nhất.
    const existing = await Review.findOne({ courseRef: courseId, userRef: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: "Bạn đã đánh giá khóa học này rồi." });
    }

    const review = await Review.create({ courseRef: courseId, userRef: req.user._id, rating, comment });

    // Tính lại trung bình cho course
    await updateCourseRating(courseId);

    res.json({ success: true, review, message: "Cảm ơn bạn đã đánh giá khóa học!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi khi lưu đánh giá." });
  }
});

module.exports = {
  router,
  updateCourseRating // export ra để admin route cũng xài
};
