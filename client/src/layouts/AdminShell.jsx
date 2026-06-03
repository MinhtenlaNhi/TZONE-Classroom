import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearAuth, getAuth, setAuth } from "../auth/auth";
import { getCurrentUser } from "../api/auth";
import { apiPath } from "../api/base";
import "./AdminShell.css";

// --- Icons ---
function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconTeachers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function IconCategories() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function IconCourses() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function IconOrders() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconReviews() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden width="16" height="16">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const navItems = [
  { to: "/admin/dashboard", label: "Tổng quan", Icon: IconDashboard, adminOnly: true },
  { to: "/admin/users", label: "Người dùng", Icon: IconUsers, adminOnly: true },
  { to: "/admin/teachers", label: "Giáo viên", Icon: IconTeachers, adminOnly: true },
  { to: "/admin/categories", label: "Danh mục", Icon: IconCategories },
  { to: "/admin/courses", label: "Khóa học", Icon: IconCourses },
  { to: "/admin/orders", label: "Đơn hàng", Icon: IconOrders },
  { to: "/admin/reviews", label: "Đánh giá", Icon: IconReviews },
];

export default function AdminShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => getAuth());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setUser(getAuth());
  }, [location.pathname]);

  // Xác minh role THẬT với server (nguồn chân lý là role trong CSDL, không phải
  // role cache trong session/JWT cũ). Tránh trường hợp phiên cũ/lệch role vẫn
  // hiển thị khu vực quản trị nhưng mọi API đều trả 403.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getCurrentUser();
        const realUser = res?.user;
        if (!active) return;
        if (!realUser || (realUser.role !== "admin" && realUser.role !== "operation")) {
          clearAuth();
          toast.error("Tài khoản của bạn không có quyền truy cập khu vực quản trị.");
          navigate("/login", { replace: true });
          return;
        }
        // Đồng bộ phiên với role thật từ server.
        const current = getAuth() || {};
        const merged = { ...current, ...realUser };
        setAuth(merged);
        setUser(merged);
      } catch {
        // Token không hợp lệ / hết hạn → quay lại đăng nhập.
        if (!active) return;
        clearAuth();
        navigate("/login", { replace: true });
      }
    })();
    return () => {
      active = false;
    };
    // Chỉ chạy 1 lần khi vào khu vực admin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    clearAuth();
    navigate("/", { replace: true });
  }

  const rawAvatar = user?.avatar || user?.picture || user?.googlePicture;
  const avatarUrl = rawAvatar ? (rawAvatar.startsWith("http") ? rawAvatar : apiPath(rawAvatar)) : null;
  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";
  const isOperation = user?.role === "operation";
  const roleLabel = isOperation ? "Bộ phận vận hành" : "Quản trị viên";
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || !isOperation);
  const homePath = isOperation ? "/admin/categories" : "/admin/dashboard";

  return (
    <div className="admin-shell">
      {/* OVERLAY FOR MOBILE */}
      <div 
        className={`admin-shell__overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* SIDEBAR */}
      <aside className={`admin-shell__sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-shell__logo-area">
          <Link to={homePath} className="admin-shell__logo">
            TZONE
          </Link>
        </div>
        <nav className="admin-shell__nav">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-shell__nav-item ${isActive ? "active" : ""}`}
            >
              <span className="admin-shell__nav-icon"><item.Icon /></span>
              {item.label}
              {/* Optional: Add badge for Teachers if there are pending (Can be implemented later via context) */}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="admin-shell__content-wrap">
        {/* HEADER */}
        <header className="admin-shell__header">
          <div className="admin-shell__header-left">
            <button 
              className="admin-shell__menu-btn" 
              onClick={() => setSidebarOpen(true)}
              aria-label="Mở menu"
            >
              <IconMenu width="24" height="24" />
            </button>
            <div className="admin-shell__search">
              <span className="admin-shell__search-icon">
                <IconSearch width="16" height="16" />
              </span>
              <input type="text" className="admin-shell__search-input" placeholder="Tìm kiếm (nhấn /)" />
            </div>
          </div>
          
          <div className="admin-shell__header-right">
            <div className="admin-shell__profile">
              <div className="admin-shell__profile-text">
                <span className="admin-shell__profile-name">{displayName}</span>
                <span className="admin-shell__profile-role">{roleLabel}</span>
              </div>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="admin-shell__profile-avatar" />
              ) : (
                <div className="admin-shell__profile-avatar">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button className="admin-shell__logout-btn" onClick={handleLogout} title="Đăng xuất">
              <IconLogout />
              Đăng xuất
            </button>
          </div>
        </header>

        {/* MAIN AREA */}
        <main className="admin-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
