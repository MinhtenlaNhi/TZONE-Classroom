const express = require("express");
const Category = require("../models/Category");
const Course = require("../models/Course");
const { isDbReady } = require("../db");
const { authMiddleware } = require("../middlewares/auth");
const { isStaff } = require("../middlewares/role");

const router = express.Router();

// Tất cả các route dưới đây yêu cầu đăng nhập và quyền admin hoặc bộ phận vận hành
router.use(authMiddleware, isStaff);

/** GET /api/admin/categories - Lấy tất cả danh mục (bao gồm cả không active) */
router.get("/", async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ success: false, message: "DB chưa sẵn sàng" });
  try {
    const categories = await Category.find({}).sort({ order: 1, createdAt: -1 }).lean();
    return res.json({ success: true, categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/** POST /api/admin/categories - Tạo danh mục mới */
router.post("/", async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ success: false, message: "DB chưa sẵn sàng" });
  try {
    const { name, slug, description, order, isActive } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: "Tên và Slug là bắt buộc" });
    }

    const exists = await Category.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, message: "Slug đã tồn tại, vui lòng chọn slug khác" });
    }

    const category = await Category.create({ name, slug, description, order, isActive });
    return res.status(201).json({ success: true, category, message: "Tạo danh mục thành công" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/** PUT /api/admin/categories/:id - Cập nhật danh mục */
router.put("/:id", async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ success: false, message: "DB chưa sẵn sàng" });
  try {
    const { id } = req.params;
    const { name, slug, description, order, isActive } = req.body;

    if (slug) {
      const exists = await Category.findOne({ slug, _id: { $ne: id } });
      if (exists) {
        return res.status(400).json({ success: false, message: "Slug đã tồn tại, vui lòng chọn slug khác" });
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, slug, description, order, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
    }

    return res.json({ success: true, category, message: "Cập nhật thành công" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/** DELETE /api/admin/categories/:id - Xóa danh mục */
router.delete("/:id", async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ success: false, message: "DB chưa sẵn sàng" });
  try {
    const { id } = req.params;
    
    // Kiểm tra xem có khóa học nào đang dùng danh mục này không
    const coursesCount = await Course.countDocuments({ categoryRef: id });
    if (coursesCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Không thể xóa vì đang có ${coursesCount} khóa học thuộc danh mục này` 
      });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
    }

    return res.json({ success: true, message: "Xóa danh mục thành công" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

module.exports = router;
