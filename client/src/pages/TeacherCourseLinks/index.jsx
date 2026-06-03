import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { fetchCourseLinks, putCourseMeetLink } from "../../api/courseLinks";
import { getAuth } from "../../auth/auth";
import { canUseTeacherCourseLinkTools } from "../../auth/teacherApproval";
import { useCourses } from "../../context/CoursesContext";
import "./TeacherCourseLinks.css";

// SVG Icons
const IconInfo = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const IconBook = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const IconLink = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
const IconLock = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconEye = ({ show, toggle }) => (
  <svg onClick={toggle} style={{cursor: 'pointer'}} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {show ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle><line x1="1" y1="1" x2="23" y2="23"></line></>
    ) : (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></>
    )}
  </svg>
);
const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const IconArrowLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconClock = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconShield = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const IconSparkles = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>;

export default function TeacherCourseLinksPage() {
  const auth = getAuth();
  const { courses } = useCourses();
  
  const myCourses = courses.filter(
    (c) => auth?.role === "admin" || (c.instructorRef && c.instructorRef === auth?._id)
  );

  const [courseId, setCourseId] = useState("");
  const [meetUrl, setMeetUrl] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingLink, setLoadingLink] = useState(false);

  useEffect(() => {
    if (!myCourses.length) return;
    if (!courseId || !myCourses.some((c) => c.id === courseId)) {
      setCourseId(myCourses[0].id);
    }
  }, [myCourses, courseId]);

  useEffect(() => {
    if (!courseId) return;
    setLoadingLink(true);
    fetchCourseLinks(courseId)
      .then((data) => setMeetUrl(data.meetUrl || ""))
      .catch(() => setMeetUrl(""))
      .finally(() => setLoadingLink(false));
  }, [courseId]);

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  const allowed = canUseTeacherCourseLinkTools(auth);
  if (!allowed) {
    if (auth.accountType === "teacher" && auth.role !== "admin") {
      return (
        <div className="tcl-page">
          <div className="tcl-container">
            <h1 className="tcl-title">Gửi link lớp học trực tuyến</h1>
            <p className="tcl-lead">
              Tài khoản giáo viên của bạn <strong>đang chờ quản trị viên phê duyệt</strong>. Sau khi được duyệt, bạn có thể
              cập nhật link lớp học tại đây. Nếu cần hỗ trợ, vui lòng liên hệ ban quản trị.
            </p>
            <Link className="tcl-back" to="/dashboard">
              <IconArrowLeft /> Về Tổng quan
            </Link>
          </div>
        </div>
      );
    }
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!courseId || !meetUrl.trim()) {
      setErr("Chọn khóa và nhập link (Google Meet, Zoom, …).");
      return;
    }
    if (!password) {
      setErr("Nhập mật khẩu để xác nhận.");
      return;
    }
    setSaving(true);
    try {
      await putCourseMeetLink({
        courseId,
        email: auth.email,
        password,
        meetUrl: meetUrl.trim()
      });
      setMsg("Đã lưu link. Học viên sẽ dùng link này cho toàn bộ khóa học.");
      setPassword("");
    } catch (e2) {
      setErr(e2.message || "Không lưu được.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tcl-page">
      <div className="tcl-container">
        <div className="tcl-card">
          
          {/* Header Banner */}
          <div className="tcl-header">
            <div className="tcl-header-ill">
              <svg width="160" height="160" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="90" fill="#f0fdf4"/>
                <rect x="40" y="60" width="120" height="80" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="2"/>
                <circle cx="50" cy="70" r="3" fill="#cbd5e1"/>
                <circle cx="60" cy="70" r="3" fill="#cbd5e1"/>
                <circle cx="70" cy="70" r="3" fill="#cbd5e1"/>
                <rect x="40" y="80" width="120" height="2" fill="#e2e8f0"/>
                <circle cx="100" cy="120" r="30" fill="#00a260"/>
                <path d="M108 120L95 110V130L108 120Z" fill="white"/>
                <path d="M140 140C145.523 140 150 135.523 150 130C150 124.477 145.523 120 140 120" stroke="#00a260" strokeWidth="4" strokeLinecap="round"/>
                <path d="M130 150C124.477 150 120 145.523 120 140C120 134.477 124.477 130 130 130" stroke="#00a260" strokeWidth="4" strokeLinecap="round"/>
                <path d="M125 145L145 125" stroke="#00a260" strokeWidth="4" strokeLinecap="round"/>
                <path d="M60 160L50 150L70 145L60 160Z" fill="#3b82f6"/>
              </svg>
            </div>
            <div className="tcl-header-content">
              <h1>Gửi link lớp học trực tuyến</h1>
              <p>Chọn khóa học và nhập <strong>một link cố định</strong> (Google Meet, Zoom…). Học viên dùng chung link này cho toàn bộ khóa.</p>
              <div className="tcl-alert">
                <IconInfo />
                <span>Yêu cầu tài khoản <strong>email + mật khẩu</strong> đã đăng ký với vai trò <strong>giáo viên</strong> (hoặc quản trị viên). Đăng nhập Google chưa hỗ trợ lưu link qua API này.</span>
              </div>
            </div>
          </div>

          <div className="tcl-body">
            {/* Form Column */}
            <div className="tcl-form-col">
              <form className="tcl-form" onSubmit={handleSubmit}>
                <div className="tcl-field">
                  <label>Khóa học</label>
                  <div className="tcl-input-wrapper">
                    <IconBook />
                    <select value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={saving || myCourses.length === 0}>
                      {myCourses.length === 0 ? (
                        <option value="">Chưa được phân công khóa học nào</option>
                      ) : (
                        myCourses.map((c) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="tcl-field">
                  <label>Link lớp (Google Meet / Zoom)</label>
                  <div className="tcl-input-wrapper">
                    <IconLink />
                    <input
                      type="url"
                      value={meetUrl}
                      onChange={(e) => setMeetUrl(e.target.value)}
                      placeholder={loadingLink ? "Đang tải link hiện tại…" : "https://meet.google.com/..."}
                      autoComplete="off"
                      disabled={loadingLink}
                    />
                  </div>
                </div>

                <div className="tcl-field">
                  <label>Mật khẩu xác nhận</label>
                  <div className="tcl-input-wrapper">
                    <IconLock />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu đăng nhập TZone"
                      autoComplete="current-password"
                    />
                    <span className="tcl-icon-btn"><IconEye show={showPassword} toggle={() => setShowPassword(!showPassword)} /></span>
                  </div>
                </div>

                {err && <p className="tcl-msg error">{err}</p>}
                {msg && <p className="tcl-msg success">{msg}</p>}

                <button type="submit" className="tcl-btn-submit" disabled={saving || loadingLink}>
                  <IconSend /> {saving ? "Đang lưu…" : "Lưu link"}
                </button>
              </form>

              <Link className="tcl-back" to="/dashboard">
                <IconArrowLeft /> Về Tổng quan
              </Link>
            </div>

            {/* Info Column */}
            <div className="tcl-info-col">
              <h3>Lợi ích</h3>
              <ul className="tcl-benefits">
                <li>
                  <div className="tcl-b-icon"><IconClock /></div>
                  <div className="tcl-b-text">
                    <strong>Một link cho cả khóa</strong>
                    <p>Không cần gắn link riêng từng buổi — cập nhật một lần, dùng suốt khóa học.</p>
                  </div>
                </li>
                <li>
                  <div className="tcl-b-icon"><IconShield /></div>
                  <div className="tcl-b-text">
                    <strong>Bảo mật</strong>
                    <p>Chỉ giáo viên phụ trách khóa mới được cập nhật link.</p>
                  </div>
                </li>
                <li>
                  <div className="tcl-b-icon"><IconSparkles /></div>
                  <div className="tcl-b-text">
                    <strong>Dễ dàng sử dụng</strong>
                    <p>Học viên luôn tìm thấy link lớp ngay trong không gian học tập.</p>
                  </div>
                </li>
              </ul>

              <div className="tcl-ill-footer">
                <svg width="180" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 100 Q 30 70 20 60 Q 30 50 40 70 Q 50 40 60 50 Q 50 70 40 100" fill="#34d399"/>
                  <rect x="30" y="100" width="20" height="20" rx="4" fill="#94a3b8"/>
                  <rect x="80" y="90" width="90" height="10" rx="2" fill="#fcd34d" />
                  <rect x="80" y="100" width="90" height="10" rx="2" fill="#fbbf24" />
                  <rect x="75" y="80" width="95" height="10" rx="2" fill="#60a5fa" />
                  <rect x="85" y="70" width="80" height="10" rx="2" fill="#34d399" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
