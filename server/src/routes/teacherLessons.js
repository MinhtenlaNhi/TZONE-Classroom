const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const { authMiddleware } = require("../middlewares/auth");
const { findStudentSubmissions } = require("../utils/submissionHelpers");

const router = express.Router();

const isTeacher = (req, res, next) => {
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Quyền truy cập bị từ chối." });
  }
  next();
};

const { upload } = require("../utils/cloudinary");

// Middleware xác nhận GV có quyền với Lesson này không
const verifyLessonOwnership = async (req, res, next) => {
  const { id } = req.params; // lessonId
  try {
    const lesson = await Lesson.findById(id).populate("courseRef");
    if (!lesson) return res.status(404).json({ success: false, message: "Không tìm thấy bài học." });
    
    if (lesson.courseRef.instructorRef?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Truy cập bị từ chối." });
    }

    if (lesson.isSectionPlaceholder) {
      return res.status(400).json({ success: false, message: "Không thể thao tác trên bản ghi placeholder của chương." });
    }
    
    req.lesson = lesson;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

// 0. PUT /api/teacher/lessons/:id - Cập nhật bài học
router.put("/:id", authMiddleware, isTeacher, verifyLessonOwnership, async (req, res) => {
  try {
    const { title, isFreePreview } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Tên bài học không được để trống." });
    }

    req.lesson.title = title.trim();
    if (typeof isFreePreview === "boolean") {
      req.lesson.isFreePreview = isFreePreview;
    }

    await req.lesson.save();
    res.json({ success: true, message: "Đã cập nhật bài học.", lesson: req.lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

// 1. POST /api/teacher/lessons/:id/materials - Upload tài liệu bài giảng
router.post("/:id/materials", authMiddleware, isTeacher, verifyLessonOwnership, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Không tìm thấy file upload." });
    
    const { title, kind: bodyKind } = req.body;
    const fileUrl = req.file.path;
    const isVideo = bodyKind === "video" || (req.file.mimetype || "").startsWith("video/");

    req.lesson.materials.push({
      title: title?.trim() || req.file.originalname,
      url: fileUrl,
      kind: isVideo ? "video" : "file"
    });

    await req.lesson.save();
    res.json({ success: true, message: "Upload tài liệu thành công.", materials: req.lesson.materials });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

// 1.5 PUT /api/teacher/lessons/:id/materials/:materialId - Cập nhật tên / thay file tài liệu
router.put("/:id/materials/:materialId", authMiddleware, isTeacher, verifyLessonOwnership, upload.single("file"), async (req, res) => {
  try {
    const { materialId } = req.params;
    const material = req.lesson.materials.id(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài liệu." });
    }

    const { title, kind: bodyKind } = req.body;
    if (title?.trim()) material.title = title.trim();
    if (req.file) {
      material.url = req.file.path;
      const isVideo = bodyKind === "video" || (req.file.mimetype || "").startsWith("video/");
      material.kind = isVideo ? "video" : "file";
    }

    await req.lesson.save();
    res.json({ success: true, message: "Đã cập nhật tài liệu.", materials: req.lesson.materials });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

// 1.6 DELETE /api/teacher/lessons/:id/materials/:materialId - Xóa tài liệu
router.delete("/:id/materials/:materialId", authMiddleware, isTeacher, verifyLessonOwnership, async (req, res) => {
  try {
    const { materialId } = req.params;
    const material = req.lesson.materials.id(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài liệu." });
    }

    req.lesson.materials.pull(materialId);
    await req.lesson.save();
    res.json({ success: true, message: "Đã xóa tài liệu.", materials: req.lesson.materials });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

// 2. POST /api/teacher/lessons/:id/assignments - Tạo bài tập (Quiz/Essay)
router.post("/:id/assignments", authMiddleware, isTeacher, verifyLessonOwnership, async (req, res) => {
  try {
    const { type, title, description, questions } = req.body;
    
    if (!type || !title) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc." });
    }

    const assignment = new Assignment({
      courseRef: req.lesson.courseRef._id,
      lessonRef: req.lesson._id,
      type,
      title,
      essayDescription: type === "essay" ? description : undefined,
      questions: type === "quiz" ? questions : []
    });

    await assignment.save();
    res.json({ success: true, message: "Đã tạo bài tập.", assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

// 3. PUT /api/teacher/lessons/:id/assignments/:assignmentId - Cập nhật bài tập
router.put("/:id/assignments/:assignmentId", authMiddleware, isTeacher, verifyLessonOwnership, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { title, description, questions } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: "Thiếu tiêu đề bài tập." });
    }

    const assignment = await Assignment.findOne({ _id: assignmentId, lessonRef: req.lesson._id });
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài tập." });
    }

    assignment.title = title;
    if (assignment.type === "essay") {
      assignment.essayDescription = description;
    } else if (assignment.type === "quiz") {
      assignment.questions = questions;
    }

    await assignment.save();
    res.json({ success: true, message: "Đã cập nhật bài tập.", assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

// 4. GET /api/teacher/lessons/:id/submissions - Lấy danh sách bài nộp của tất cả bài tập trong một bài học
router.get("/:id/submissions", authMiddleware, isTeacher, verifyLessonOwnership, async (req, res) => {
  try {
    const assignments = await Assignment.find({ lessonRef: req.lesson._id });
    const assignmentIds = assignments.map(a => a._id);

    const submissions = await findStudentSubmissions(
      { assignmentRef: { $in: assignmentIds } },
      [{ path: "assignmentRef", select: "title type" }]
    );

    res.json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

module.exports = router;
