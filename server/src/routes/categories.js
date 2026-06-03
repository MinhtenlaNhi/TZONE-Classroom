const express = require("express");
const Category = require("../models/Category");
const { isDbReady } = require("../db");

const router = express.Router();

/** Công khai: lấy danh sách các danh mục đang active, sắp xếp theo order */
router.get("/", async (req, res) => {
  if (!isDbReady()) {
    return res.json({ success: true, categories: [] });
  }
  try {
    const rows = await Category.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
    const categories = rows.map(({ _id, __v, ...rest }) => ({
      id: _id, // Map _id to id for frontend convenience
      ...rest
    }));
    return res.json({ success: true, categories });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ.", categories: [] });
  }
});

module.exports = router;
