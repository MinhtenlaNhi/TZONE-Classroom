const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Enrollment = require("../models/Enrollment");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

const isStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ success: false, message: "Chỉ học viên mới được nộp bài tập." });
  }
  next();
};

const { upload } = require("../utils/cloudinary");

// Kiểm tra user có quyền làm bài tập trong course này không
const checkEnrollment = async (req, courseId) => {
  const enr = await Enrollment.findOne({ user: req.user._id, course: courseId });
  return !!enr;
};

// 1. Lấy danh sách bài tập của 1 lesson
router.get("/lesson/:lessonId", authMiddleware, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const assignments = await Assignment.find({ lessonRef: lessonId }).lean();
    
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({ 
      studentRef: req.user._id, 
      assignmentRef: { $in: assignmentIds } 
    }).lean();

    // Xóa correctAnswerIndex để tránh bị lộ ở list
    const safeAssignments = assignments.map(a => {
      const sub = submissions.find(s => s.assignmentRef.toString() === a._id.toString());
      a.mySubmission = sub || null;

      if (a.type === "quiz") {
        a.questions = a.questions.map(q => {
          const { correctAnswerIndex, explanation, ...rest } = q;
          return rest;
        });
      }
      return a;
    });

    res.json({ success: true, assignments: safeAssignments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 2. Lấy chi tiết một bài tập (ẩn đáp án nếu chưa nộp)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) return res.status(404).json({ success: false, message: "Không tìm thấy bài tập." });

    const hasEnrolled = await checkEnrollment(req, assignment.courseRef);
    if (!hasEnrolled) return res.status(403).json({ success: false, message: "Bạn chưa đăng ký khóa học này." });

    // Kiểm tra đã nộp bài chưa
    const submission = await Submission.findOne({ 
      assignmentRef: assignment._id, 
      studentRef: req.user._id 
    }).lean();

    // Nếu chưa nộp thì giấu đáp án
    if (!submission && assignment.type === "quiz") {
      assignment.questions = assignment.questions.map(q => {
        const { correctAnswerIndex, explanation, ...rest } = q;
        return rest;
      });
    }

    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 3. Lấy submission của tôi (trong 1 bài tập cụ thể)
router.get("/:id/my-submission", authMiddleware, async (req, res) => {
  try {
    const submission = await Submission.findOne({ 
      assignmentRef: req.params.id, 
      studentRef: req.user._id 
    }).lean();

    res.json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 3.5. Lấy TẤT CẢ submissions của tôi trên toàn hệ thống
router.get("/my-submissions/all", authMiddleware, async (req, res) => {
  try {
    const submissions = await Submission.find({ studentRef: req.user._id })
      .populate({
        path: "assignmentRef",
        select: "title type dueDate courseRef",
        populate: {
          path: "courseRef",
          select: "title thumbnail"
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy danh sách bài làm" });
  }
});

// 4. Submit bài tập (dùng array answers cho quiz, và formData cho essay)
router.post("/:id/submit", authMiddleware, isStudent, upload.single("file"), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: "Bài tập không tồn tại" });

    const hasEnrolled = await checkEnrollment(req, assignment.courseRef);
    if (!hasEnrolled) return res.status(403).json({ success: false, message: "Chưa đăng ký khóa học" });

    // Kiểm tra xem đã nộp chưa
    const existing = await Submission.findOne({ assignmentRef: assignment._id, studentRef: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: "Bạn đã nộp bài tập này rồi." });
    }

    if (assignment.type === "quiz") {
      // Body.answers phải là JSON mảng các index [0, 2, 1...]
      const userAnswers = req.body.answers || []; // lấy từ mảng
      
      let correctCount = 0;
      const totalQ = assignment.questions.length;
      
      assignment.questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctAnswerIndex) {
          correctCount++;
        }
      });

      const score = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

      const sub = new Submission({
        assignmentRef: assignment._id,
        studentRef: req.user._id,
        type: "quiz",
        answers: userAnswers,
        score: score,
        status: "graded" // chấm xong ngay lập tức
      });
      await sub.save();

      return res.json({ success: true, submission: sub, message: "Đã nộp bài thành công!" });
    } else {
      // Type: Essay
      const { textContent } = req.body;
      const fileUrl = req.file ? req.file.path : "";

      const sub = new Submission({
        assignmentRef: assignment._id,
        studentRef: req.user._id,
        type: "essay",
        textContent,
        fileUrl,
        status: "pending" // Chờ GV chấm
      });
      await sub.save();

      return res.json({ success: true, submission: sub, message: "Đã nộp bài tự luận, chờ giáo viên chấm." });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi nộp bài" });
  }
});

module.exports = router;
