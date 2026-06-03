const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");
const { isDbReady } = require("../db");

/**
 * Middleware xác thực JWT.
 * Gắn req.user (Mongoose document) nếu hợp lệ.
 */
async function authMiddleware(req, res, next) {
  if (!isDbReady()) {
    return res.status(503).json({ success: false, message: "Cơ sở dữ liệu chưa sẵn sàng." });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Vui lòng đăng nhập." });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
  }

  try {
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "Tài khoản không tồn tại." });
    }
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên." });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("[authMiddleware]", err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
}

/**
 * Middleware xác thực tùy chọn — không bắt buộc đăng nhập.
 * Nếu có token hợp lệ → gắn req.user, không thì bỏ qua.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ") || !isDbReady()) {
    return next();
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) return next();
  try {
    const user = await User.findById(decoded.userId);
    if (user && !user.isBlocked) {
      req.user = user;
    }
  } catch {
    /* ignore */
  }
  next();
}

module.exports = { authMiddleware, optionalAuth };
