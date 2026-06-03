const express = require("express");
const Review = require("../models/Review");
const { updateCourseRating } = require("./reviews");
const { authMiddleware } = require("../middlewares/auth");
const { isStaff } = require("../middlewares/role");

const router = express.Router();

// 1. Lấy tất cả reviews (Có populate course title và user info)
router.get("/", authMiddleware, isStaff, async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = {};
    if (courseId) filter.courseRef = courseId;

    const reviews = await Review.find(filter)
      .populate("userRef", "name email")
      .populate("courseRef", "title")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 2. Ẩn/Hiện đánh giá
router.put("/:id/toggle-hide", authMiddleware, isStaff, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Không tìm thấy" });

    review.isHidden = !review.isHidden;
    await review.save();

    // Tính lại điểm vì ẩn đi thì không tính vào trung bình nữa
    await updateCourseRating(review.courseRef);

    res.json({ success: true, isHidden: review.isHidden, message: review.isHidden ? "Đã ẩn đánh giá" : "Đã hiển thị đánh giá" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 3. Xóa vĩnh viễn đánh giá
router.delete("/:id", authMiddleware, isStaff, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Không tìm thấy" });

    const courseId = review.courseRef;
    await Review.findByIdAndDelete(req.params.id);
    
    await updateCourseRating(courseId);

    res.json({ success: true, message: "Đã xóa đánh giá" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

module.exports = router;
