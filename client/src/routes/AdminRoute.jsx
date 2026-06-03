import { Navigate } from "react-router-dom";
import { getAuth } from "../auth/auth";

export default function AdminRoute({ children }) {
  const auth = getAuth();
  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  if (auth.role !== "admin" && auth.role !== "operation") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
