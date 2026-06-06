import { Navigate } from "react-router-dom";
import { getAuth } from "../auth/auth";
import { markOnboardingComplete } from "../auth/onboardingStorage";

/** Onboarding đã bỏ chọn vai trò — chuyển thẳng vào workspace. */
export default function OnboardingRoute() {
  const auth = getAuth();
  if (!auth?.email) {
    return <Navigate to="/login" replace />;
  }
  markOnboardingComplete(auth.email);
  if (auth.role === "admin" || auth.role === "operation") {
    return <Navigate to="/admin" replace />;
  }
  if (auth.role === "teacher") {
    return <Navigate to="/teacher/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}
