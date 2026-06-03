import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import "../Login/styles.css";

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

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [msgType, setMsgType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setMessage("Mật khẩu cần ít nhất 6 ký tự.");
      setMsgType("error");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      setMsgType("error");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const data = await resetPassword(token, password);
      setMessage(data.message);
      setMsgType("success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.message);
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-page__header">
        <Link to="/" className="login-page__logo">
          TZONE
        </Link>
      </header>

      <div className="login-page__split">
        <div className="login-page__form-col">
          <h1 className="login-page__title">Đặt lại mật khẩu</h1>
          <p style={{ color: "#666", marginBottom: "2rem", lineHeight: "1.5" }}>
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {message && (
              <p
                className={msgType === "error" ? "login-google-err" : "login-google-hint"}
                role="alert"
                style={msgType === "success" ? { color: "#4CAF50", backgroundColor: "#E8F5E9", border: "1px solid #C8E6C9" } : {}}
              >
                {message}
              </p>
            )}

            <div className="login-field">
              <label className="login-field__label" htmlFor="reset-password">
                Mật khẩu mới
              </label>
              <div className="login-field__password-wrap">
                <input
                  id="reset-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="login-field__input login-field__input--pill login-field__input--with-toggle"
                  placeholder="Ít nhất 6 ký tự"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setMessage(null);
                  }}
                  disabled={loading}
                  required
                  autoFocus
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

            <div className="login-field">
              <label className="login-field__label" htmlFor="reset-confirm">
                Xác nhận mật khẩu
              </label>
              <div className="login-field__password-wrap">
                <input
                  id="reset-confirm"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="login-field__input login-field__input--pill login-field__input--with-toggle"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setMessage(null);
                  }}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirmPassword ? <IconEyeClosed /> : <IconEyeOpen />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn-primary" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>

          <p className="login-page__footer" style={{ marginTop: "2rem" }}>
            <Link className="login-page__footer-link" to="/login">
              ← Quay lại đăng nhập
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
