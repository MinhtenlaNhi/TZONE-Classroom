const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  courseRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  priceAtPurchase: {
    type: Number, // Giá bán tại thời điểm đặt hàng (số, hoặc lưu chuỗi nếu không xử lý toán học nhiều)
    required: true
  },
  priceString: {
    type: String, // Chuỗi giá gốc (vd: "3.200.000đ")
  }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number, // Tổng tiền tính bằng số để dễ report doanh thu
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["transfer"],
    required: true,
    default: "transfer"
  },
  status: {
    type: String,
    enum: ["pending", "paid", "cancelled"],
    default: "pending"
  },
  transferReceipt: {
    type: String // Đường dẫn đến ảnh hóa đơn chuyển khoản (nếu thanh toán bằng chuyển khoản)
  },
  cancelReason: {
    type: String // Lý do hủy nếu status = cancelled
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
