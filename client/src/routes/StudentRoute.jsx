import { Navigate } from "react-router-dom";
import { getAuth } from "../auth/auth";

/** Chỉ học viên được dùng workspace StudentShell — giáo viên (kể cả chờ duyệt) bị chuyển về /teacher. */
export default function StudentRoute({ children }) {
  const auth = getAuth();
  if (auth?.role === "admin" || auth?.role === "operation") {
    return <Navigate to="/admin" replace />;
  }
  if (auth?.role === "teacher") {
    return <Navigate to="/teacher/dashboard" replace />;
  }
  return children;
}
