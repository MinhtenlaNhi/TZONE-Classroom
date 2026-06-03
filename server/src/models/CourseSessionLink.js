const mongoose = require("mongoose");

const courseSessionLinkSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true, trim: true, index: true },
    /** 0 = Thứ 2 … 6 = Chủ nhật — khớp `sessions.col` trên client */
    weekdayCol: { type: Number, required: true, min: 0, max: 6 },
    meetUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

courseSessionLinkSchema.index({ courseId: 1, weekdayCol: 1 }, { unique: true });

module.exports = mongoose.model("CourseSessionLink", courseSessionLinkSchema);
