import { Link, Navigate } from "react-router-dom";
import { getAuth } from "../../auth/auth";
import "./TeacherDashboard.css";

// --- SVG Icons ---
const IconChalkboard = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="9" y1="21" x2="9" y2="9"></line>
  </svg>
);

const IconLink = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

export default function TeacherDashboard() {
  const auth = getAuth();

  if (!auth || (auth.role !== "teacher" && auth.role !== "admin")) {
    return <Navigate to="/" replace />;
  }

  if (auth.role === "teacher" && auth.teacherApprovalStatus !== "approved") {
    return (
      <div className="tz-td-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h2 style={{ color: '#f59e0b', marginBottom: '15px' }}>Tài khoản đang chờ phê duyệt</h2>
          <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '20px' }}>
            Xin chào <strong>{auth.name}</strong>, tài khoản giáo viên của bạn hiện đang trong trạng thái <strong>{auth.teacherApprovalStatus === 'rejected' ? 'bị từ chối' : 'chờ phê duyệt'}</strong>.
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            Vui lòng liên hệ với Quản trị viên hệ thống để được xét duyệt quyền truy cập vào bảng điều khiển giáo viên.
          </p>
          <div style={{ marginTop: '25px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <Link to="/dashboard" style={{ padding: '10px 24px', border: '1px solid #ddd', color: '#4b5563', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' }}>
              Trang học viên
            </Link>
            <Link to="/" style={{ padding: '10px 24px', background: 'var(--primary-color)', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' }}>
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const name = auth.name || auth.email?.split("@")[0] || "Giảng viên";

  return (
    <div className="tz-td-page">
      <div className="tz-td-container">
        
        {/* Banner */}
        <div className="tz-td-banner">
          <div className="tz-td-banner-content">
            <h1>Bảng điều khiển Giảng viên</h1>
            <p>Chào mừng <strong>{name}</strong>! Chúc bạn một ngày làm việc hiệu quả.</p>
          </div>
          <div className="tz-td-banner-graphic">
            <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" width="200" height="120">
              <path d="M20,100 L40,60 L60,80 L90,30 L120,70 L150,40 L180,90 Z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinejoin="round"/>
              <circle cx="90" cy="30" r="6" fill="#fff"/>
              <circle cx="150" cy="40" r="6" fill="#fff"/>
              <circle cx="180" cy="90" r="6" fill="#fff"/>
            </svg>
          </div>
        </div>

        {/* Action Grid */}
        <div className="tz-td-grid">
          
          <Link to="/teacher/courses" className="tz-td-card">
            <div className="tz-td-icon green"><IconChalkboard /></div>
            <div className="tz-td-info">
              <h2>Quản lý Lớp học</h2>
              <p>Xem danh sách học viên, soạn giáo trình bài học, giao bài tập và chấm bài trực tiếp.</p>
              <span className="tz-td-action">Truy cập ngay →</span>
            </div>
          </Link>

          <Link to="/teacher/course-links" className="tz-td-card">
            <div className="tz-td-icon blue"><IconLink /></div>
            <div className="tz-td-info">
              <h2>Gắn Link Google Meet</h2>
              <p>Gửi link phòng học trực tuyến (Google Meet, Zoom) — một link cố định cho cả khóa.</p>
              <span className="tz-td-action">Truy cập ngay →</span>
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}
