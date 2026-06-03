const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    avatar: { type: String, default: "" },

    /* --- Authentication --- */
    passwordHash: { type: String, default: null },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },
    googlePicture: { type: String, default: "" },

    /* --- Role & permissions --- */
    role: {
      type: String,
      enum: ["student", "teacher", "admin", "operation"],
      default: "student"
    },
    /** Chỉ áp dụng khi role === "teacher". */
    teacherApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: undefined
    },
    /** Mã giảng viên hiển thị (VD: CT3108). */
    teacherCode: { type: String, unique: true, sparse: true, trim: true },

    /* --- Account status --- */
    isBlocked: { type: Boolean, default: false },

    /* --- Password reset --- */
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

/** Tự động set teacherApprovalStatus cho teacher mới. */
userSchema.pre("save", function (next) {
  if (this.isNew && this.role === "teacher") {
    if (this.teacherApprovalStatus == null || this.teacherApprovalStatus === "") {
      this.teacherApprovalStatus = "pending";
    }
  }
  next();
});

/** Trả về object an toàn (không leak passwordHash, resetToken). */
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
