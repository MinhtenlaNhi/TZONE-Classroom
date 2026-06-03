const mongoose = require("mongoose");

const emailRegistrationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher"], required: true },
    /** Chỉ áp dụng khi role === teacher: chờ admin duyệt. */
    teacherApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: undefined
    },
    /** Mã giảng viên hiển thị (VD: CT3108), gán khi duyệt hoặc lần đầu public API. */
    teacherCode: { type: String, unique: true, sparse: true, trim: true }
  },
  { timestamps: true }
);

emailRegistrationSchema.pre("save", function (next) {
  if (this.isNew && this.role === "teacher") {
    if (this.teacherApprovalStatus == null || this.teacherApprovalStatus === "") {
      this.teacherApprovalStatus = "pending";
    }
  }
  next();
});

module.exports = mongoose.model("EmailRegistration", emailRegistrationSchema);
