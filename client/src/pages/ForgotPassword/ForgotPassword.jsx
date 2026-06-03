import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth";
import "../Login/styles.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [msgType, setMsgType] = useState(""); // "success" | "error"

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const data = await forgotPassword(email.trim());
      setMessage(data.message);
      setMsgType("success");
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
          <h1 className="login-page__title">Quên mật khẩu</h1>
          <p style={{ color: "#666", marginBottom: "2rem", lineHeight: "1.5" }}>
            Nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
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
              <label className="login-field__label" htmlFor="forgot-email">
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                className="login-field__input login-field__input--pill"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setMessage(null);
                }}
                disabled={loading}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="login-btn-primary" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
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
