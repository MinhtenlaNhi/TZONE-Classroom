const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    col: { type: Number, required: true, min: 0, max: 6 },
    startMin: { type: Number, required: true, min: 0, max: 24 * 60 },
    endMin: { type: Number, required: true, min: 0, max: 24 * 60 }
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    categoryId: {
      type: String,
      required: true
    },
    categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    badge: { type: String, default: "" },
    description: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    title: { type: String, required: true, trim: true },
    schedule: { type: String, default: "", trim: true },
    sessions: { type: [sessionSchema], default: [] },
    totalSessions: { type: Number, default: 0 },
    sessionDuration: { type: Number, default: 90 }, // phút/buổi
    startDate: { type: String, default: "" },
    enrollmentOpenDate: { type: Date, default: null },
    enrollmentCloseDate: { type: Date, default: null },
    isPublished: { type: Boolean, default: false },
    trialLessonCount: { type: Number, default: 2 },
    enrolled: { type: String, default: "0" },
    capacity: { type: String, default: "30" },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    ratingLabel: { type: String, default: "—" },
    price: { type: String, default: "" },
    instructor: { type: String, default: "" },
    instructorRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    /** Link phòng học trực tuyến (Google Meet, Zoom…) — dùng chung cho cả khóa */
    meetUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
