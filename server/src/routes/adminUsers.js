const express = require("express");
const bcrypt = require("bcryptjs");
const { authMiddleware } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/role");
const User = require("../models/User");
const Order = require("../models/Order");

const router = express.Router();

// Lấy danh sách users
router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20, role } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// Thêm user mới
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đủ tên, email, mật khẩu" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email đã tồn tại" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      passwordHash,
      role: role || "student",
      teacherApprovalStatus: role === "teacher" ? "approved" : undefined
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "Tạo người dùng thành công", user: newUser.toSafeObject() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// Cập nhật thông tin user
router.put("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ success: false, message: "User không tồn tại" });

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ success: false, message: "Email đã tồn tại" });
      user.email = email;
    }

    if (name) user.name = name;
    if (role && ["student", "teacher", "admin", "operation"].includes(role)) {
      if (user._id.toString() === req.user._id.toString() && role !== "admin") {
        return res.status(403).json({ success: false, message: "Không thể tự hạ quyền của chính mình" });
      }
      user.role = role;
      if (role === "teacher" && !user.teacherApprovalStatus) {
        user.teacherApprovalStatus = "approved";
      }
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ success: true, message: "Cập nhật thành công", user: user.toSafeObject() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// Khóa / Mở khóa user
router.put("/:id/toggle-block", authMiddleware, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User không tồn tại" });
    
    // Không cho phép block các admin khác (hoặc chính mình) trừ khi có superadmin
    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Không thể khóa tài khoản Admin" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ 
      success: true, 
      isBlocked: user.isBlocked, 
      message: user.isBlocked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản" 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// Thay đổi vai trò user
router.put("/:id/role", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "teacher", "admin", "operation"].includes(role)) {
      return res.status(400).json({ success: false, message: "Vai trò không hợp lệ" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy user" });

    // Không cho phép tự hạ quyền admin của chính mình
    if (user._id.toString() === req.user._id.toString() && role !== "admin") {
      return res.status(403).json({ success: false, message: "Không thể tự hạ quyền của chính mình" });
    }

    user.role = role;
    if (role === "teacher" && !user.teacherApprovalStatus) {
      user.teacherApprovalStatus = "approved"; // tự động duyệt nếu admin gán quyền
    }
    await user.save();

    res.json({ success: true, message: "Cập nhật vai trò thành công", user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// Xem lịch sử đơn hàng của user
router.get("/:id/orders", authMiddleware, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id })
      .populate("courses.course", "title")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

module.exports = router;
