import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_STORAGE_KEY, getAuth } from "../../auth/auth";
import {
  clearPendingRegisterRole,
  consumePendingRegisterRole,
  markOnboardingComplete
} from "../../auth/onboardingStorage";
import "./styles.css";

const ROLE_OPTIONS = [
  { value: "student", label: "Tôi là học sinh" },
  { value: "teacher", label: "Tôi là giáo viên" }
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [accountType, setAccountType] = useState("student");

  useEffect(() => {
    const fromDbRole = auth?.role;
    if (fromDbRole === "teacher") {
      setAccountType("teacher");
      clearPendingRegisterRole();
      return;
    }
    const fromDb = auth?.accountType;
    if (fromDb === "student" || fromDb === "teacher") {
      setAccountType(fromDb);
      clearPendingRegisterRole();
      return;
    }
    const pending = consumePendingRegisterRole();
    if (pending) setAccountType(pending);
  }, [auth?.role, auth?.accountType]);

  const roleLocked = auth?.role === "teacher";

  function handleContinue(e) {
    e.preventDefault();
    if (!auth?.email) {
      navigate("/login", { replace: true });
      return;
    }

    const resolvedType = roleLocked ? "teacher" : accountType;

    markOnboardingComplete(auth.email);
    try {
      const next = {
        ...auth,
        role: resolvedType === "teacher" ? "teacher" : "student",
        accountType: resolvedType,
        at: Date.now()
      };
      if (resolvedType === "teacher") {
        if (auth?.provider === "email" || auth?.role === "teacher") {
          next.role = "teacher";
          next.teacherApprovalStatus = auth.teacherApprovalStatus ?? "pending";
        } else {
          delete next.teacherApprovalStatus;
        }
      } else {
        next.role = "student";
        delete next.teacherApprovalStatus;
      }
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }

    if (
      resolvedType === "teacher" &&
      auth?.teacherApprovalStatus !== "approved"
    ) {
      window.alert(
        "Tài khoản giáo viên của bạn đang chờ quản trị viên phê duyệt. Bạn sẽ được thông báo khi được duyệt."
      );
    }

    if (resolvedType === "teacher") {
      navigate("/teacher/dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }

  return (
    <div className="onboarding">
      <header className="onboarding__header">
        <Link className="onboarding__link-home" to="/">
          Trang chủ
        </Link>
        <Link className="onboarding__btn-register" to="/register">
          Đăng ký
        </Link>
      </header>

      <div className="onboarding__inner">
        <div className="onboarding__form-block">
          <p className="onboarding__kicker">CHÀO MỪNG BẠN ĐẾN VỚI</p>
          <h1 className="onboarding__brand">TZONE</h1>

          <form className="onboarding__form" onSubmit={handleContinue}>
            <label className="onboarding__label" htmlFor="onboarding-role">
              Vai trò của bạn
            </label>
            <select
              id="onboarding-role"
              className="onboarding__select"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              disabled={roleLocked}
            >
              {ROLE_OPTIONS.filter((o) => !roleLocked || o.value === "teacher").map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {roleLocked ? (
              <p className="onboarding__hint" style={{ marginTop: "0.75rem", color: "#64748b", fontSize: "0.9rem" }}>
                Tài khoản giáo viên đã được đăng ký — không thể chuyển sang vai trò học sinh.
              </p>
            ) : null}
            <button type="submit" className="onboarding__submit">
              Tiếp tục
            </button>
          </form>
        </div>

        <div className="onboarding__art" aria-hidden>
          <div className="onboarding__img-wrap">
            <img
              className="onboarding__img"
              src="/images/onboarding-illustration.png"
              alt="Minh họa học viên học online"
              width={520}
              height={420}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
