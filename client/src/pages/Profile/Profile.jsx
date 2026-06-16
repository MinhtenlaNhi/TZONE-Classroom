import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, uploadAvatar } from "../../api/users";
import { changePassword } from "../../api/auth";
import { getAuth, setAuth } from "../../auth/auth";
import { apiPath } from "../../api/base";
import "./Profile.css";

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

export default function ProfilePage({ variant = "student" }) {
  const isTeacherView = variant === "teacher";
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState("");

  // Profile form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Password form
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdMsgType, setPwdMsgType] = useState("");

  // Password toggles
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const fileRef = useRef(null);

  useEffect(() => {
    if (!isTeacherView && getAuth()?.role === "teacher") {
      navigate("/teacher/account", { replace: true });
    }
  }, [isTeacherView, navigate]);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getProfile();
      setUser(data.user);
      setName(data.user.name || "");
      setPhone(data.user.phone || "");
    } catch (err) {
      setMsg(err.message);
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) {
      setMsg("Tên không được để trống.");
      setMsgType("error");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const data = await updateProfile({ name: name.trim(), phone: phone.trim() });
      setUser(data.user);
      const auth = getAuth();
      if (auth) {
        setAuth({
          ...auth,
          ...data.user,
          name: data.user.name,
          phone: data.user.phone,
          role: auth.role || data.user.role,
          teacherApprovalStatus: auth.teacherApprovalStatus ?? data.user.teacherApprovalStatus,
          at: Date.now()
        });
      }
      setMsg("Cập nhật thành công!");
      setMsgType("success");
    } catch (err) {
      setMsg(err.message);
      setMsgType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(null);
    try {
      const data = await uploadAvatar(file);
      setUser(data.user);
      const auth = getAuth();
      if (auth) {
        setAuth({
          ...auth,
          ...data.user,
          avatar: data.user.avatar,
          role: auth.role || data.user.role,
          teacherApprovalStatus: auth.teacherApprovalStatus ?? data.user.teacherApprovalStatus,
          at: Date.now()
        });
      }
      setMsg("Cập nhật avatar thành công!");
      setMsgType("success");
    } catch (err) {
      setMsg(err.message);
      setMsgType("error");
    }
  }

  async function handleChangePwd(e) {
    e.preventDefault();
    if (newPwd.length < 6) {
      setPwdMsg("Mật khẩu mới cần ít nhất 6 ký tự.");
      setPwdMsgType("error");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg("Mật khẩu xác nhận không khớp.");
      setPwdMsgType("error");
      return;
    }
    setPwdMsg(null);
    try {
      const data = await changePassword(currentPwd, newPwd);
      setPwdMsg(data.message || "Đổi mật khẩu thành công!");
      setPwdMsgType("success");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      setPwdMsg(err.message);
      setPwdMsgType("error");
    }
  }

  function getAvatarUrl() {
    const url = user?.avatar || user?.googlePicture || user?.picture;
    if (!url) return null;
    return url.startsWith("http") ? url : apiPath(url);
  }

  function getInitial() {
    return (user?.name || user?.email || "?").charAt(0).toUpperCase();
  }

  const roleLabels = { student: "Học viên", teacher: "Giảng viên", admin: "Quản trị viên" };

  if (loading) {
    return (
      <div className="profile-page">
        <p style={{ color: "#94a3b8" }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>Thông tin cá nhân</h1>

      {msg && <div className={`profile-message ${msgType}`}>{msg}</div>}

      {/* Avatar */}
      <div className="profile-avatar-section">
        {getAvatarUrl() ? (
          <img src={getAvatarUrl()} alt="Avatar" className="profile-avatar" />
        ) : (
          <div className="profile-avatar-placeholder">{getInitial()}</div>
        )}
        <div className="profile-avatar-actions">
          <label>
            📷 Đổi ảnh đại diện
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </label>
          <span className="avatar-info">JPG, PNG, GIF, WebP</span>
          {user?.role && (
            <span className={`profile-role-badge ${user.role}`}>
              {roleLabels[user.role] || user.role}
            </span>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <form onSubmit={handleSave}>
        <div className="profile-section">
          <h2>Thông tin cơ bản</h2>
          <div className="profile-field">
            <label htmlFor="profile-name">Họ và tên</label>
            <input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="profile-field">
            <label htmlFor="profile-email">Email</label>
            <input id="profile-email" value={user?.email || ""} disabled />
            <span className="field-info">
              {user?.authProvider === "google" ? "Đăng nhập bằng Google" : "Đăng nhập bằng email"}
            </span>
          </div>
          <div className="profile-field">
            <label htmlFor="profile-phone">Số điện thoại</label>
            <input
              id="profile-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0901234567"
            />
          </div>
          <div className="profile-actions">
            <button type="submit" className="profile-btn primary" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </form>

      {/* Change Password */}
      {user?.authProvider === "local" && (
        <div className="profile-section">
          <h2>Đổi mật khẩu</h2>
          {!showPwdForm ? (
            <button
              type="button"
              className="profile-btn secondary"
              onClick={() => setShowPwdForm(true)}
            >
              Đổi mật khẩu
            </button>
          ) : (
            <form onSubmit={handleChangePwd}>
              {pwdMsg && <div className={`profile-message ${pwdMsgType}`}>{pwdMsg}</div>}
              
              <div className="profile-field">
                <label htmlFor="pwd-current">Mật khẩu hiện tại</label>
                <div className="profile-password-wrap">
                  <input
                    id="pwd-current"
                    type={showCurrentPwd ? "text" : "password"}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="profile-password-toggle"
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    aria-label={showCurrentPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showCurrentPwd ? <IconEyeClosed /> : <IconEyeOpen />}
                  </button>
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="pwd-new">Mật khẩu mới</label>
                <div className="profile-password-wrap">
                  <input
                    id="pwd-new"
                    type={showNewPwd ? "text" : "password"}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    required
                  />
                  <button
                    type="button"
                    className="profile-password-toggle"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    aria-label={showNewPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showNewPwd ? <IconEyeClosed /> : <IconEyeOpen />}
                  </button>
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="pwd-confirm">Xác nhận mật khẩu mới</label>
                <div className="profile-password-wrap">
                  <input
                    id="pwd-confirm"
                    type={showConfirmPwd ? "text" : "password"}
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="profile-password-toggle"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    aria-label={showConfirmPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showConfirmPwd ? <IconEyeClosed /> : <IconEyeOpen />}
                  </button>
                </div>
              </div>

              <div className="profile-actions">
                <button type="submit" className="profile-btn primary">
                  Xác nhận đổi
                </button>
                <button
                  type="button"
                  className="profile-btn secondary"
                  onClick={() => {
                    setShowPwdForm(false);
                    setPwdMsg(null);
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      )}

    </div>
  );
}
