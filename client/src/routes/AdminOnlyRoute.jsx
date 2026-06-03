import { Navigate } from "react-router-dom";
import { getAuth, getAdminHomePath } from "../auth/auth";

/**
 * Bảo vệ các trang chỉ dành cho admin (Tổng quan, Người dùng, Giáo viên).
 * Bộ phận vận hành sẽ bị chuyển về trang mặc định của họ.
 */
export default function AdminOnlyRoute({ children }) {
  const auth = getAuth();
  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  if (auth.role !== "admin") {
    return <Navigate to={getAdminHomePath()} replace />;
  }
  return children;
}
