import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getAuth } from "../auth/auth";
import { canUseTeacherCourseLinkTools } from "../auth/teacherApproval";
import { apiPath } from "../api/base";
import "./UserNavMenu.css";

function IconOverview() {
  return (
    <svg className="user-nav__dd-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg className="user-nav__dd-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconCourses() {
  return (
    <svg className="user-nav__dd-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16v12H4V6zM8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconDdPerson() {
  return (
    <svg className="user-nav__dd-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M6 20v-1a6 6 0 0112 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconDdStar() {
  return (
    <svg className="user-nav__dd-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3l2.6 5.3L20 9.3l-4 3.9.9 5.8L12 16.9 7.1 19l.9-5.8-4-3.9 5.4-.9L12 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function IconDdTests() {
  return (
    <svg className="user-nav__dd-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 5h10v16H5V9l4-4zM9 5v4H5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconDdLogout() {
  return (
    <svg className="user-nav__dd-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2v-2M10 12h10m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function accountBadgeLabel(user) {
  if (!user) return "Học sinh";
  if (user.role === "admin") return "Quản trị";
  if (user.role === "operation") return "Vận hành";
  if (user.role === "teacher") return "Giáo viên";
  return "Học sinh";
}

function shortDisplayName(user, fallback) {
  const n = user?.name?.trim();
  if (!n) return fallback;
  const parts = n.split(/\s+/);
  return parts[0] || fallback;
}

export default function UserNavMenu() {
  const [user, setUser] = useState(() => getAuth());
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getAuth());
  }, [location.pathname, location.key]);

  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  if (!user?.email) {
    return (
      <div className="auth-buttons">
        <Link to="/login" className="auth-link">
          Đăng nhập
        </Link>
        <Link to="/register" className="auth-btn-register">
          Đăng ký
        </Link>
      </div>
    );
  }

  const displayName = user.name || user.email.split("@")[0] || "Tài khoản";
  const rawAvatar = user.avatar || user.picture || user.googlePicture;
  const avatarUrl = rawAvatar ? (rawAvatar.startsWith("http") ? rawAvatar : apiPath(rawAvatar)) : null;
  const badgeText = accountBadgeLabel(user);
  const nameShort = shortDisplayName(user, displayName);
  const isTeacher = user.role === "teacher";

  function handleLogout() {
    clearAuth();
    setUser(null);
    setOpen(false);
    navigate("/", { replace: true });
  }

  return (
    <div className="auth-buttons user-nav" ref={wrapRef}>
      <button
        type="button"
        className="user-nav__trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Tài khoản: ${displayName}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="user-nav__avatar-wrap">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="user-nav__avatar"
              width={36}
              height={36}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="user-nav__avatar-fallback" aria-hidden>
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </span>
        <span className="user-nav__name">{displayName}</span>
        <span className={`user-nav__chev ${open ? "user-nav__chev--open" : ""}`} aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="user-nav__dropdown" role="menu">
          <div className="user-nav__dd-header">
            <div className="user-nav__dd-header-avatar" aria-hidden>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" width={48} height={48} referrerPolicy="no-referrer" />
              ) : (
                <span className="user-nav__dd-header-fallback">{nameShort.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="user-nav__dd-header-text">
              <div className="user-nav__dd-name-row">
                <span className="user-nav__dd-badge">{badgeText}</span>
                <span className="user-nav__dd-name">{nameShort}</span>
              </div>
              <p className="user-nav__dd-email">{user?.email}</p>
            </div>
          </div>
          <div className="user-nav__dd-sep" role="separator" />

          <div className="user-nav__dd-sep" role="separator" />

          {isTeacher ? (
            <>
              <Link className="user-nav__item" role="menuitem" to="/teacher/dashboard" onClick={() => setOpen(false)}>
                <IconOverview /> Workspace Giảng viên
              </Link>
              <Link className="user-nav__item" role="menuitem" to="/teacher/account" onClick={() => setOpen(false)}>
                <IconDdPerson /> Thông tin cá nhân
              </Link>
            </>
          ) : (
            <>
              <Link className="user-nav__item" role="menuitem" to="/dashboard" onClick={() => setOpen(false)}>
                <IconOverview /> Tổng quan
              </Link>
              <Link className="user-nav__item" role="menuitem" to="/schedule" onClick={() => setOpen(false)}>
                <IconCalendar /> Lịch học
              </Link>
              <Link className="user-nav__item" role="menuitem" to="/my-courses" onClick={() => setOpen(false)}>
                <IconCourses /> Các khóa học của bạn
              </Link>

              <div className="user-nav__dd-sep" role="separator" />

              <Link className="user-nav__item" role="menuitem" to="/account" onClick={() => setOpen(false)}>
                <IconDdPerson /> Thông tin cá nhân
              </Link>
              <Link className="user-nav__item" role="menuitem" to="/reviews" onClick={() => setOpen(false)}>
                <IconDdStar /> Đánh giá
              </Link>
              <Link className="user-nav__item" role="menuitem" to="/tests" onClick={() => setOpen(false)}>
                <IconDdTests /> Các bài kiểm tra
              </Link>
            </>
          )}

          {canUseTeacherCourseLinkTools(user) ? (
            <>
              <div className="user-nav__dd-sep" role="separator" />
              <Link className="user-nav__item" role="menuitem" to="/teacher/course-links" onClick={() => setOpen(false)}>
                <IconDdTests /> Gắn link Meet
              </Link>
            </>
          ) : null}

          {user?.role === "admin" || user?.role === "operation" ? (
            <>
              <div className="user-nav__dd-sep" role="separator" />
              <Link className="user-nav__item" role="menuitem" to="/admin" onClick={() => setOpen(false)}>
                <IconDdPerson /> {user?.role === "operation" ? "Bộ phận vận hành" : "Quản trị"}
              </Link>
            </>
          ) : null}

          <div className="user-nav__dd-sep" role="separator" />
          <button type="button" className="user-nav__item user-nav__item--danger" role="menuitem" onClick={handleLogout}>
            <IconDdLogout /> Đăng xuất
          </button>
        </div>
      ) : null}
    </div>
  );
}
