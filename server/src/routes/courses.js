const express = require("express");
const Course = require("../models/Course");
const { isDbReady } = require("../db");

const router = express.Router();

/** Công khai: lấy danh sách khóa học (có phân trang, lọc, tìm kiếm) */
router.get("/", async (req, res) => {
  if (!isDbReady()) {
    return res.json({ success: true, courses: [], total: 0, page: 1, totalPages: 1 });
  }
  try {
    const { search, category, minPrice, maxPrice, rating, sort, page = 1, limit = 12 } = req.query;
    
    // Build query filter
    const query = { isPublished: true }; // Only show published courses publicly
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    if (category) {
      // category có thể là slug hoặc Object ID. 
      // Nhưng frontend sẽ gọi bằng ID (hoặc categoryRef). 
      // Để linh hoạt, ta cứ query theo categoryId (cũ) hoặc categoryRef.
      // Dưới đây chỉ lọc theo categoryRef nếu truyền id chuẩn, hoặc regex
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.categoryRef = category;
      } else {
        query.categoryId = category;
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Build sort options
    let sortObj = { createdAt: -1 }; // Mặc định mới nhất
    if (sort === "price_asc") sortObj = { price: 1 };
    else if (sort === "price_desc") sortObj = { price: -1 };
    else if (sort === "rating_desc") sortObj = { rating: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const total = await Course.countDocuments(query);
    const rows = await Course.find(query)
      .populate("categoryRef", "name slug")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();
      
    // Transform to frontend format (strip internal mongo fields if needed)
    const courses = rows.map(({ __v, ...rest }) => rest);
    
    return res.json({ 
      success: true, 
      courses,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ.", courses: [], total: 0 });
  }
});

/** Công khai: Lấy chi tiết 1 khóa học theo ID */
router.get("/:id", async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ success: false, message: "Cơ sở dữ liệu chưa sẵn sàng." });
  
  try {
    const course = await Course.findOne({ 
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { id: req.params.id }],
      isPublished: true 
    })
    .populate("categoryRef", "name slug")
    .lean();

    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
    }

    const { __v, ...safeCourse } = course;
    return res.json({ success: true, course: safeCourse });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

module.exports = router;
