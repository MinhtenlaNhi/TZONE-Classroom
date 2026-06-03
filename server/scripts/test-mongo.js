/**
 * Kiểm tra MONGODB_URI trong server/.env (chạy: node scripts/test-mongo.js từ thư mục server).
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;
if (!uri || !String(uri).trim()) {
  console.error("Thiếu MONGODB_URI trong server/.env");
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(async () => {
    console.log("Kết nối MongoDB: OK");
    const cols = await mongoose.connection.db.listCollections().toArray();
    console.log(
      "Collections:",
      cols.length ? cols.map((c) => c.name).join(", ") : "(chưa có — bình thường nếu DB mới)"
    );
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error("Kết nối MongoDB: LỖI");
    console.error(err.message);
    process.exit(1);
  });
