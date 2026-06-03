import { Navigate, useLocation } from "react-router-dom";
import { getAuth } from "../auth/auth";

export default function PrivateRoute({ children }) {
  const location = useLocation();
  if (!getAuth()?.email) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
