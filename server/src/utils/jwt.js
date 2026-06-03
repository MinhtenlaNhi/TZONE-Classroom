const jwt = require("jsonwebtoken");

function getSecret() {
  return process.env.JWT_SECRET || "tzone_dev_secret_change_in_production";
}

/**
 * Tạo JWT token cho user.
 * @param {Object} user — Mongoose document hoặc plain object có _id, email, role.
 * @returns {string} JWT token
 */
function generateToken(user) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

/**
 * Verify và decode JWT token.
 * @param {string} token
 * @returns {Object|null} decoded payload hoặc null nếu không hợp lệ.
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
