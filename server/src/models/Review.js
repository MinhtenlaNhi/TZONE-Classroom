const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  courseRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  userRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Mỗi user chỉ có 1 review cho 1 course
ReviewSchema.index({ courseRef: 1, userRef: 1 }, { unique: true });

module.exports = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
