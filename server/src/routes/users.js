const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

const { upload } = require("../utils/cloudinary");

/* ───── GET /api/users/me ───── */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    return res.json({ success: true, user: req.user.toSafeObject() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/* ───── PUT /api/users/me ───── */
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body || {};
    const user = req.user;

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) {
        return res.status(400).json({ success: false, message: "Tên không được để trống." });
      }
      user.name = trimmed;
    }

    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }

    await user.save();
    return res.json({ success: true, user: user.toSafeObject() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/* ───── POST /api/users/me/avatar ───── */
router.post("/me/avatar", authMiddleware, (req, res) => {
  upload.single("avatar")(req, res, async (err) => {
    if (err) {
      const msg = err instanceof multer.MulterError
        ? (err.code === "LIMIT_FILE_SIZE" ? "File quá lớn (tối đa 5MB)." : err.message)
        : err.message;
      return res.status(400).json({ success: false, message: msg });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn file ảnh." });
    }
    try {
      const user = req.user;
      // Cloudinary trả về URL file trên đám mây qua `req.file.path`
      user.avatar = req.file.path;
      await user.save();
      return res.json({ success: true, avatar: user.avatar, user: user.toSafeObject() });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
  });
});

module.exports = router;
