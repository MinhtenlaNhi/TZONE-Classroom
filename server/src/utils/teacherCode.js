const User = require("../models/User");

/**
 * Sinh mã giảng viên dạng CTxxxx (4 chữ số), đảm bảo unique trong User.
 */
async function generateUniqueTeacherCode() {
  for (let attempt = 0; attempt < 60; attempt++) {
    const num = 1000 + Math.floor(Math.random() * 9000);
    const code = `CT${num}`;
    const exists = await User.exists({ teacherCode: code });
    if (!exists) return code;
  }
  const fallback = `CT${Date.now().toString().slice(-4)}`;
  const exists = await User.exists({ teacherCode: fallback });
  if (!exists) return fallback;
  return `CT${Date.now().toString(36).toUpperCase().replace(/[^0-9A-Z]/g, "").slice(-6)}`;
}

/**
 * Gán teacherCode nếu giáo viên chưa có (document Mongoose đã load).
 */
async function ensureTeacherHasCode(user) {
  if (!user || user.role !== "teacher") return;
  if (user.teacherCode && String(user.teacherCode).trim()) return;
  user.teacherCode = await generateUniqueTeacherCode();
}

module.exports = { generateUniqueTeacherCode, ensureTeacherHasCode };
