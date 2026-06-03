const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  courseRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false }); // No separate _id for items to keep it clean

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true // Mỗi user chỉ có 1 giỏ hàng
  },
  items: [CartItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.models.Cart || mongoose.model("Cart", CartSchema);
