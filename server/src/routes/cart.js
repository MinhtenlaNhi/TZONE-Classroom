const express = require("express");
const Cart = require("../models/Cart");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { authMiddleware } = require("../middlewares/auth");
const { isEnrollmentOpen } = require("../utils/enrollment");
const { checkCoursePurchaseEligibility } = require("../utils/coursePurchase");

const router = express.Router();

// Lấy giỏ hàng của user
router.get("/", authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.courseRef",
      select: "id title price thumbnail categoryRef schedule sessionDuration totalSessions",
      populate: { path: "categoryRef", select: "name slug" }
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    return res.json({ success: true, cart });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy giỏ hàng." });
  }
});

// Thêm khóa học vào giỏ hàng
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "Thiếu courseId." });
    }

    // 1. Kiểm tra khóa học có tồn tại không
    // Có thể truyền lên _id (ObjectId) hoặc id (string)
    const course = await Course.findOne({
      $or: [{ _id: courseId.match(/^[0-9a-fA-F]{24}$/) ? courseId : null }, { id: courseId }]
    });

    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học." });
    }

    if (!isEnrollmentOpen(course)) {
      return res.status(400).json({ success: false, message: "Khóa học hiện không nhận đăng ký." });
    }

    const existingEnrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
    const purchaseCheck = checkCoursePurchaseEligibility(course, existingEnrollment);
    if (!purchaseCheck.ok) {
      return res.status(400).json({ success: false, message: purchaseCheck.message });
    }

    // 3. Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // 4. Kiểm tra xem đã có trong giỏ chưa
    const isAlreadyInCart = cart.items.some(item => item.courseRef.toString() === course._id.toString());
    if (isAlreadyInCart) {
      return res.status(400).json({ success: false, message: "Khóa học đã có trong giỏ hàng." });
    }

    // 5. Thêm vào giỏ
    cart.items.push({ courseRef: course._id });
    await cart.save();

    return res.json({ success: true, message: "Đã thêm vào giỏ hàng." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ khi thêm vào giỏ hàng." });
  }
});

// Xóa khóa học khỏi giỏ
router.delete("/:courseId", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giỏ hàng." });
    }

    const { courseId } = req.params;
    // courseId truyền lên có thể là string id hoặc ObjectId của khóa học. Do items lưu ObjectId nên phải tìm ObjectId.
    const course = await Course.findOne({
      $or: [{ _id: courseId.match(/^[0-9a-fA-F]{24}$/) ? courseId : null }, { id: courseId }]
    });

    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học." });
    }

    cart.items = cart.items.filter(item => item.courseRef.toString() !== course._id.toString());
    await cart.save();

    return res.json({ success: true, message: "Đã xóa khỏi giỏ hàng." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ khi xóa khỏi giỏ hàng." });
  }
});

module.exports = router;
