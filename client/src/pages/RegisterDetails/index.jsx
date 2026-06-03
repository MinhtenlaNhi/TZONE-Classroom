import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { AUTH_STORAGE_KEY, clearAuth, resolveRole, setToken } from "../../auth/auth";
import {
  clearPendingRegisterRole,
  hasCompletedOnboarding,
  setPendingRegisterRole
} from "../../auth/onboardingStorage";
import { loginWithEmail, registerAccount, syncGoogleAccount } from "../../api/auth";
import "./styles.css";

const TEACHER_PENDING_MSG =
  "Tài khoản giáo viên của bạn đang chờ quản trị viên phê duyệt. Bạn sẽ được thông báo khi được duyệt. Nhấn OK để chuyển đến trang đăng nhập.";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const IMG_BY_ROLE = {
  student: "/images/register/student.png",
  teacher: "/images/register/teacher.png"
};

const ALT_BY_ROLE = {
  student: "Học sinh bước qua cửa, chào đón hành trình học tập",
  teacher: "Giáo viên đánh giá và theo dõi danh sách công việc"
};

const TITLE_BY_ROLE = {
  student: "Bạn đăng ký với vai trò học sinh",
  teacher: "Bạn đăng ký với vai trò giáo viên"
};

function IconArrowLeft() {
  return (
    <svg className="register-details__change-role-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function IconGoogle() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function IconEyeOpen() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.5" r="3.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconEyeClosed() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18M10.58 10.59a3 3 0 104 4.82M9.88 9.88A7.06 7.06 0 001.11 12.5c1.73 4.39 6 7.5 11 7.5 1.62 0 3.15-.36 4.52-1M14.12 14.12A7 7 0 0122.89 12.5C21.16 8.11 16.89 5 11.89 5c-1.62 0-3.15.36-4.52 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleRegisterButton({ role }) {
  const navigate = useNavigate();
  const [googleErr, setGoogleErr] = useState(null);

  const login = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      setGoogleErr(null);
      try {
        const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        if (!r.ok) throw new Error("userinfo");
        const profile = await r.json();
        const email = profile.email;
        try {
          const res = await syncGoogleAccount({
            email,
            name: profile.name,
            picture: profile.picture
          });
          const { token, user } = res;
          setToken(token);
          
          const appRole = resolveRole(email) === "admin" ? "admin" : user.role;
          
          sessionStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({
              provider: "google",
              _id: user._id,
              email: user.email,
              name: user.name,
              picture: profile.picture,
              avatar: user.avatar || "",
              role: appRole,
              accountType: user.role,
              at: Date.now()
            })
          );

          if (appRole === "admin") {
            clearPendingRegisterRole();
            navigate("/admin");
          } else if (!hasCompletedOnboarding(email)) {
            navigate("/onboarding");
          } else {
            clearPendingRegisterRole();
            if (appRole === "teacher") {
              navigate("/teacher/dashboard");
            } else {
              navigate("/dashboard");
            }
          }
        } catch (err) {
          if (err.code === "LOCAL_EMAIL_EXISTS") {
            setGoogleErr(
              err.message ||
                "Email này đã đăng ký bằng mật khẩu. Vui lòng đăng nhập bằng email và mật khẩu."
            );
          } else {
            setGoogleErr(err.message || "Không thể đồng bộ tài khoản Google.");
          }
          return;
        }

      } catch {
        setGoogleErr("Không lấy được thông tin tài khoản Google.");
      }
    },
    onError: () => setGoogleErr("Đăng ký Google bị hủy hoặc lỗi.")
  });

  return (
    <>
      {googleErr ? (
        <p className="register-details__google-err" role="alert">
          {googleErr}
        </p>
      ) : null}
      <button type="button" className="register-details__google" onClick={() => login()}>
        <IconGoogle />
        Đăng ký với Google
      </button>
    </>
  );
}

function GoogleRegisterPlaceholder() {
  return (
    <>
      <p className="register-details__google-err" style={{ color: "var(--rd-muted)" }}>
        Thêm <code>VITE_GOOGLE_CLIENT_ID</code> trong <code>client/.env</code> để dùng Google.
      </p>
      <button type="button" className="register-details__google" disabled>
        <IconGoogle />
        Đăng ký với Google
      </button>
    </>
  );
}

export default function RegisterDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const raw = searchParams.get("role");
  const role = raw === "teacher" || raw === "student" ? raw : null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [formErr, setFormErr] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (role) setPendingRegisterRole(role);
  }, [role]);

  if (!role) {
    return <Navigate to="/register" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormErr(null);
    const nameTrim = name.trim();
    const em = email.trim();
    if (!nameTrim) {
      setFormErr("Vui lòng nhập tên.");
      return;
    }
    if (!EMAIL_RE.test(em)) {
      setFormErr("Email không hợp lệ.");
      return;
    }
    if (password.length < 6) {
      setFormErr("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setFormErr("Mật khẩu xác nhận không khớp.");
      return;
    }

    setSubmitting(true);
    try {
      await registerAccount({
        email: em,
        name: nameTrim,
        password,
        role
      });
      const { user, token } = await loginWithEmail({ email: em, password });
      setToken(token);
      
      const appRole = resolveRole(user.email) === "admin" ? "admin" : user.role;
      
      if (role === "teacher") {
        clearAuth();
        window.alert(TEACHER_PENDING_MSG);
        clearPendingRegisterRole();
        navigate("/login");
        return;
      }
      const payload = {
        provider: "email",
        _id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture || "",
        avatar: user.avatar || "",
        role: appRole,
        accountType: user.role,
        at: Date.now()
      };
      if (user.role === "teacher") {
        payload.teacherApprovalStatus = user.teacherApprovalStatus ?? "approved";
      }
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
      if (appRole === "admin") {
        clearPendingRegisterRole();
        navigate("/admin");
      } else if (!hasCompletedOnboarding(user.email)) {
        navigate("/onboarding");
      } else {
        clearPendingRegisterRole();
        if (appRole === "teacher") {
          navigate("/teacher/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      if (err.code === "GOOGLE_EMAIL" || err.code === "REGISTERED") {
        setFormErr(err.message);
      } else {
        setFormErr(err.message || "Đăng ký thất bại.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="register-details">
      <header className="register-details__header">
        <Link className="register-details__logo" to="/">
          TZONE
        </Link>
        <Link className="register-details__login" to="/login">
          Đăng nhập
        </Link>
      </header>

      <div className="register-details__title-wrap">
        <h1 className="register-details__title">{TITLE_BY_ROLE[role]}</h1>
      </div>

      <div className="register-details__layout">
        <div className="register-details__form-wrap">
          <Link className="register-details__change-role" to="/register">
            <IconArrowLeft />
            Thay thế vai trò
          </Link>

          <form onSubmit={handleSubmit} noValidate>
            {formErr ? (
              <p className="register-details__form-error" role="alert">
                {formErr}
              </p>
            ) : null}

            <div className="register-details__field">
              <label className="register-details__label" htmlFor="reg-name">
                Tên
              </label>
              <input
                id="reg-name"
                name="name"
                type="text"
                autoComplete="name"
                className="register-details__input"
                placeholder="Tên của bạn"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormErr(null);
                }}
                disabled={submitting}
              />
            </div>

            <div className="register-details__field">
              <label className="register-details__label" htmlFor="reg-email">
                Email
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                className="register-details__input"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormErr(null);
                }}
                disabled={submitting}
              />
            </div>

            <div className="register-details__field">
              <label className="register-details__label" htmlFor="reg-password">
                Mật khẩu
              </label>
              <div className="register-details__input-wrap">
                <input
                  id="reg-password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  className="register-details__input register-details__input--with-toggle"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormErr(null);
                  }}
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="register-details__pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPw ? <IconEyeClosed /> : <IconEyeOpen />}
                </button>
              </div>
            </div>

            <div className="register-details__field">
              <label className="register-details__label" htmlFor="reg-confirm">
                Xác nhận mật khẩu
              </label>
              <div className="register-details__input-wrap">
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showConfirmPw ? "text" : "password"}
                  autoComplete="new-password"
                  className="register-details__input register-details__input--with-toggle"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFormErr(null);
                  }}
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="register-details__pw-toggle"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  aria-label={showConfirmPw ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                >
                  {showConfirmPw ? <IconEyeClosed /> : <IconEyeOpen />}
                </button>
              </div>
            </div>

            <button type="submit" className="register-details__submit" disabled={submitting}>
              {submitting ? "Đang xử lý…" : "Đăng ký"}
            </button>
          </form>

          {googleClientId ? (
            <GoogleRegisterButton role={role} />
          ) : (
            <GoogleRegisterPlaceholder />
          )}

          <p className="register-details__footer">
            Đã có tài khoản?{" "}
            <Link className="register-details__footer-link" to="/login">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        <div className="register-details__art">
          <img
            src={IMG_BY_ROLE[role]}
            alt={ALT_BY_ROLE[role]}
            width={380}
            height={380}
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
