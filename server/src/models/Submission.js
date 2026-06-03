const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  assignmentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true
  },
  studentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["quiz", "essay"],
    required: true
  },
  
  // Quiz
  answers: [{ type: Number }], // index của các option đã chọn
  
  // Essay
  textContent: { type: String },
  fileUrl: { type: String },

  // Kết quả chấm điểm
  score: {
    type: Number, // điểm số / 100
  },
  status: {
    type: String,
    enum: ["pending", "graded"],
    default: "pending" // quiz có thể set graded luôn
  },
  teacherComment: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
