import { Navigate } from "react-router-dom";
import { getAuth } from "../auth/auth";
import { hasCompletedOnboarding } from "../auth/onboardingStorage";

export default function OnboardingRoute({ children }) {
  const auth = getAuth();
  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  if (auth.role === "admin" || auth.role === "operation") {
    return <Navigate to="/admin" replace />;
  }
  if (hasCompletedOnboarding(auth.email)) {
    if (auth.role === "teacher") {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
