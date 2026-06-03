const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true }, // 0, 1, 2, 3
  explanation: { type: String }
});

const AssignmentSchema = new mongoose.Schema({
  lessonRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
    required: true
  },
  courseRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["quiz", "essay"],
    required: true
  },
  dueDate: {
    type: Date
  },
  
  // Dành riêng cho Quiz
  questions: [QuestionSchema],
  
  // Dành riêng cho Essay
  essayDescription: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);
