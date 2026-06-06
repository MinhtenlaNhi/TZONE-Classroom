import { Navigate } from "react-router-dom";

/** Đăng ký công khai chỉ dành cho học sinh — bỏ màn chọn vai trò. */
export default function RegisterPage() {
  return <Navigate to="/register/details" replace />;
}
