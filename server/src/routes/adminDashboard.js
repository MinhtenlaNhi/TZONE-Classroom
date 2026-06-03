const express = require("express");
const { authMiddleware } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/role");
const User = require("../models/User");
const Course = require("../models/Course");
const Order = require("../models/Order");

const router = express.Router();

router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    
    // Tổng doanh thu từ các đơn hàng "paid"
    const revenueResult = await Order.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Doanh thu theo 12 tháng gần nhất
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1); // Ngày đầu tiên của tháng đó

    const monthlyRevenue = await Order.aggregate([
      { $match: { status: "paid", createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format lại dữ liệu theo format mảng 12 phần tử để lên biểu đồ
    const revenueByMonth = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      
      const found = monthlyRevenue.find(r => r._id.month === month && r._id.year === year);
      revenueByMonth.push({
        name: `T${month}/${year.toString().slice(2)}`,
        revenue: found ? found.total : 0
      });
    }

    // Doanh thu theo 30 ngày gần nhất
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenue = await Order.aggregate([
      { $match: { status: "paid", createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { 
            day: { $dayOfMonth: "$createdAt" }, 
            month: { $month: "$createdAt" }, 
            year: { $year: "$createdAt" } 
          },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const revenueByDay = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      
      const found = dailyRevenue.find(r => r._id.day === day && r._id.month === month && r._id.year === year);
      revenueByDay.push({
        name: `${day}/${month}`,
        revenue: found ? found.total : 0
      });
    }

    // Top 5 khóa học có số người enroll cao nhất
    const topCourses = await Course.find()
      .sort({ enrolled: -1 })
      .limit(5)
      .select("title instructor enrolled price");

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalRevenue,
        revenueByMonth,
        revenueByDay,
        topCourses
      }
    });

  } catch (err) {
    console.error("[Dashboard] Error:", err);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
});

module.exports = router;
