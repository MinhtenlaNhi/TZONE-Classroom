import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { AUTH_STORAGE_KEY, resolveRole, setToken } from "../../auth/auth";
import { loginWithEmail, syncGoogleAccount } from "../../api/auth";
import { clearPendingRegisterRole, hasCompletedOnboarding } from "../../auth/onboardingStorage";
import "./styles.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeClosed() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function GoogleSignInButton() {
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
          
          const role = resolveRole(email) === "admin" ? "admin" : user.role;
          
          const payload = {
              provider: "google",
              _id: user._id,
              email: user.email,
              name: user.name,
              picture: profile.picture,
              avatar: user.avatar || "",
              role,
              accountType: user.role,
              at: Date.now()
            };
          if (user.role === "teacher") {
            payload.teacherApprovalStatus = user.teacherApprovalStatus ?? "approved";
          }
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));

          if (role === "admin" || role === "operation") {
            clearPendingRegisterRole();
            navigate("/admin");
          } else if (!hasCompletedOnboarding(email)) {
            navigate("/onboarding");
          } else {
            clearPendingRegisterRole();
            if (role === "teacher") {
              navigate("/teacher/dashboard");
            } else {
              navigate("/dashboard");
            }
          }
        } catch (err) {
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
          if (err.code === "LOCAL_EMAIL_EXISTS") {
            setGoogleErr(
              err.message ||
                "Email này đã đăng ký bằng mật khẩu. Vui lòng đăng nhập bằng email và mật khẩu."
            );
          } else {
            setGoogleErr(err.message || "Không thể đồng bộ tài khoản Google. Kiểm tra MongoDB.");
          }
          return;
        }
      } catch {
        setGoogleErr("Không lấy được thông tin tài khoản Google.");
      }
    },
    onError: () => setGoogleErr("Đăng nhập Google bị hủy hoặc lỗi.")
  });

  return (
    <>
      {googleErr ? (
        <p className="login-google-err" role="alert">
          {googleErr}
        </p>
      ) : null}
      <button type="button" className="login-btn-google" onClick={() => login()}>
        <IconGoogle />
        Đăng nhập với Google
      </button>
    </>
  );
}

function GoogleSignInPlaceholder() {
  const isProd = import.meta.env.PROD;
  return (
    <>
      <p className="login-google-hint">
        {isProd ? (
          <>
            Đăng nhập Google chưa bật trên bản đã deploy: biến{" "}
            <code className="login-code">VITE_GOOGLE_CLIENT_ID</code> phải có{" "}
            <strong>khi chạy build</strong> (Vite nhúng giá trị vào file JS). Trên Render: Environment → thêm{" "}
            <code className="login-code">VITE_GOOGLE_CLIENT_ID</code> → deploy lại. Trong Google Cloud Console → OAuth
            client → <strong>Authorized JavaScript origins</strong> phải có URL trang của bạn (ví dụ{" "}
            <code className="login-code">https://ten-app.onrender.com</code>), không chỉ localhost.
          </>
        ) : (
          <>
            Để đăng nhập bằng Gmail/Google, tạo OAuth Client (Web) trong Google Cloud Console và thêm vào file{" "}
            <code className="login-code">client/.env</code>:{" "}
            <code className="login-code">VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com</code>
            — thêm <strong>Authorized JavaScript origin</strong>:{" "}
            <code className="login-code">http://localhost:5173</code>
          </>
        )}
      </p>
      <button type="button" className="login-btn-google login-btn-google--disabled" disabled>
        <IconGoogle />
        Đăng nhập với Google
      </button>
    </>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErr, setFormErr] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormErr(null);
    const em = email.trim();
    if (!em || !password) {
      setFormErr("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setSubmitting(true);
    try {
      const { user, token } = await loginWithEmail({ email: em, password });
      setToken(token);
      
      const role = resolveRole(user.email) === "admin" ? "admin" : user.role;
      const payload = {
        provider: "email",
        _id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture || "",
        avatar: user.avatar || "",
        role,
        accountType: user.role,
        at: Date.now()
      };
      if (user.role === "teacher") {
        payload.teacherApprovalStatus = user.teacherApprovalStatus ?? "approved";
      }
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
      if (role === "admin" || role === "operation") {
        clearPendingRegisterRole();
        navigate("/admin");
      } else if (!hasCompletedOnboarding(user.email)) {
        navigate("/onboarding");
      } else {
        clearPendingRegisterRole();
        if (role === "teacher") {
          navigate("/teacher/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setFormErr(err.message || "Đăng nhập thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <header className="login-page__header">
        <Link to="/" className="login-page__logo">
          TZONE
        </Link>
      </header>

      <div className="login-page__split">
        <div className="login-page__form-col">
          <h1 className="login-page__title">Đăng nhập</h1>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {formErr ? (
              <p className="login-google-err" role="alert">
                {formErr}
              </p>
            ) : null}

            <div className="login-field">
              <label className="login-field__label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                className="login-field__input login-field__input--pill"
                placeholder="loan@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormErr(null);
                }}
                disabled={submitting}
              />
            </div>

            <div className="login-field">
              <label className="login-field__label" htmlFor="login-password">
                Mật khẩu
              </label>
              <div className="login-field__password-wrap">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="login-field__input login-field__input--pill login-field__input--with-toggle"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormErr(null);
                  }}
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <IconEyeClosed /> : <IconEyeOpen />}
                </button>
              </div>
            </div>

            <div className="login-forgot-row">
              <Link className="login-forgot" to="/forgot-password">
                Quên mật khẩu ?
              </Link>
            </div>

            <button type="submit" className="login-btn-primary" disabled={submitting}>
              {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
            </button>
          </form>

          {googleClientId ? <GoogleSignInButton /> : <GoogleSignInPlaceholder />}

          <p className="login-page__footer">
            Bạn chưa có tài khoản?{" "}
            <Link className="login-page__footer-link" to="/register">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <div className="login-page__art-col" aria-hidden>
          <div className="login-page__img-wrap">
            <img
              className="login-page__img"
              src="/images/onboarding-illustration.png"
              alt=""
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
