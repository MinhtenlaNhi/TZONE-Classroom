const dotenv = require("dotenv");
dotenv.config();

const { connectDb } = require("./db");
const app = require("./app");

const PORT = Number.parseInt(process.env.PORT, 10) || 5000;

// Listen ngay — Render cần thấy port mở; không chờ Mongo (kết nối DB chạy nền).
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is listening on port ${PORT}`);
});

connectDb().catch(() => {
  /* đã log trong connectDb */
});
