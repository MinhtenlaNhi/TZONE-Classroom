const express = require("express");
const Order = require("../models/Order");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");
const { authMiddleware } = require("../middlewares/auth");
const { isStaff } = require("../middlewares/role");
const { checkCoursePurchaseEligibility, fulfillPaidEnrollment } = require("../utils/coursePurchase");
const { sendOrderConfirmationEmail } = require("../utils/mailer");

function getAppBaseUrl(req) {
  const configured =
    process.env.APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (req && req.headers && req.headers.origin) ||
    "http://localhost:5173";
  return String(configured).replace(/\/$/, "");
}

const router = express.Router();

// 1. Lấy danh sách tất cả đơn hàng (Admin)
router.get("/", authMiddleware, isStaff, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .populate("items.courseRef", "title price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Lấy thống kê chung (không bị ảnh hưởng bởi bộ lọc status hiện tại)
    const stats = {
      total: await Order.countDocuments(),
      pending: await Order.countDocuments({ status: "pending" }),
      paid: await Order.countDocuments({ status: "paid" }),
      cancelled: await Order.countDocuments({ status: "cancelled" })
    };

    return res.json({
      success: true,
      orders,
      stats,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy danh sách đơn hàng." });
  }
});

// 2. Chi tiết đơn hàng
router.get("/:id", authMiddleware, isStaff, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.courseRef", "id title thumbnail categoryRef price instructor")
      .lean();
      
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    
    return res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

// 3. Xác nhận đơn hàng (Duyệt)
router.put("/:id/confirm", authMiddleware, isStaff, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    
    if (order.status === "paid") {
      return res.status(400).json({ success: false, message: "Đơn hàng đã được duyệt trước đó." });
    }

    order.status = "paid";
    await order.save();

    const courseInfos = [];
    for (const item of order.items) {
      const course = await Course.findById(item.courseRef);
      const enrolled = await Enrollment.findOne({ user: order.user, course: item.courseRef });
      const purchaseCheck = checkCoursePurchaseEligibility(course, enrolled);
      if (!purchaseCheck.ok) {
        return res.status(400).json({ success: false, message: purchaseCheck.message });
      }

      await fulfillPaidEnrollment(Enrollment, {
        userId: order.user,
        courseId: item.courseRef,
        orderId: order._id
      });

      if (course) {
        courseInfos.push({
          title: course.title,
          instructor: course.instructor,
          priceAtPurchase: item.priceAtPurchase
        });
      }
    }

    // Gửi email hóa đơn xác nhận (không chặn response nếu lỗi)
    try {
      const user = await User.findById(order.user).select("name email").lean();
      if (user && user.email) {
        sendOrderConfirmationEmail(user.email, {
          customerName: user.name,
          order,
          courses: courseInfos,
          appBaseUrl: getAppBaseUrl(req)
        }).catch((emailErr) => {
          console.error("[adminOrders] Gửi hóa đơn thất bại:", emailErr.message);
        });
      }
    } catch (emailErr) {
      console.error("[adminOrders] Lỗi khi chuẩn bị email hóa đơn:", emailErr.message);
    }

    return res.json({ success: true, message: "Đã duyệt đơn hàng thành công.", order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

// 4. Hủy đơn hàng
router.put("/:id/cancel", authMiddleware, isStaff, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    
    if (order.status === "paid") {
      return res.status(400).json({ success: false, message: "Đơn hàng đã thanh toán, không thể hủy." });
    }

    order.status = "cancelled";
    if (reason) order.cancelReason = reason;
    await order.save();

    return res.json({ success: true, message: "Đã hủy đơn hàng.", order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

module.exports = router;
