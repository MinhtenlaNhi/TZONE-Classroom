/**
 * Factory tạo middleware kiểm tra role.
 * Sử dụng SAU authMiddleware — đảm bảo req.user đã tồn tại.
 *
 * @param  {...string} roles — Danh sách role được phép (vd: "admin", "teacher").
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Vui lòng đăng nhập." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập." });
    }
    next();
  };
}

const isAdmin = requireRole("admin");
const isStudent = requireRole("student", "admin");
/** Admin hoặc Bộ phận vận hành — dùng cho các module: danh mục, khóa học, đơn hàng, đánh giá. */
const isStaff = requireRole("admin", "operation");

const isTeacher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Vui lòng đăng nhập." });
  }
  if (req.user.role === "admin") {
    return next();
  }
  if (req.user.role === "teacher") {
    if (req.user.teacherApprovalStatus === "approved") {
      return next();
    } else {
      return res.status(403).json({ success: false, message: "Tài khoản giáo viên của bạn đang chờ phê duyệt hoặc đã bị từ chối." });
    }
  }
  return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập." });
};

module.exports = { requireRole, isAdmin, isTeacher, isStudent, isStaff };
