import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchMyEnrollments } from "../api/enrollmentsApi";
import { apiPath } from "../api/base";
import { getCourseLearnPath, getVisibleEnrollments } from "../utils/enrollments";
import "./MyCoursesPage.css";

// SVG Icons
const IconBook = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
);

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        const res = await fetchMyEnrollments();
        if (res.success) {
          setEnrollments(res.enrollments);
        } else {
          toast.error("Lỗi tải danh sách khóa học");
        }
      } catch (err) {
        toast.error("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    };
    loadEnrollments();
  }, []);

  const getCoverInitials = (catName, courseTitle) => {
    const text = catName?.toUpperCase() || courseTitle?.toUpperCase() || "KH";
    if (text.includes("TOEIC B")) return "TB";
    if (text.includes("TOEIC A")) return "TA";
    if (text.includes("TẬP SỰ")) return "TS";
    if (text.includes("SPEAKING")) return "TS";
    return text.substring(0, 2);
  };

  const getCoverColorClass = (catName) => {
    const name = catName?.toUpperCase() || "";
    if (name.includes("TOEIC B")) return "tz-cover-green";
    if (name.includes("TOEIC A")) return "tz-cover-blue";
    if (name.includes("TẬP SỰ")) return "tz-cover-orange";
    if (name.includes("SPEAKING")) return "tz-cover-blue";
    return "tz-cover-blue";
  };

  const visibleEnrollments = getVisibleEnrollments(enrollments);

  if (loading) {
    return (
      <div className="tz-mc-loading">
        <div className="tz-spinner"></div>
        <p>Đang tải không gian học tập của bạn...</p>
      </div>
    );
  }

  return (
    <div className="tz-mc-page">
      <div className="tz-mc-wrapper">
        
        {/* Header Banner */}
        <div className="tz-mc-header">
          <div className="tz-mc-header-content">
            <h1>Khóa học của tôi</h1>
            <p>Tiếp tục hành trình chinh phục mục tiêu của bạn. Chúc bạn học tốt!</p>
          </div>
          <div className="tz-mc-header-illustration">
            <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" width="200" height="120">
              <path d="M10,80 Q30,40 80,50 T160,30 Q190,60 180,100 Q150,130 90,110 T10,80 Z" fill="rgba(255,255,255,0.1)" />
              <rect x="110" y="70" width="50" height="12" rx="2" fill="rgba(255,255,255,0.8)" />
              <rect x="105" y="82" width="60" height="12" rx="2" fill="rgba(255,255,255,0.6)" />
              <rect x="100" y="94" width="70" height="12" rx="2" fill="rgba(255,255,255,0.4)" />
              <path d="M135,40 L100,55 L135,70 L170,55 Z" fill="#fff" />
              <path d="M110,60 L110,75 C110,80 160,80 160,75 L160,60" fill="none" stroke="#fff" strokeWidth="3" opacity="0.8" />
            </svg>
          </div>
        </div>

        {visibleEnrollments.length === 0 ? (
          <div className="tz-mc-empty">
            <div className="tz-mc-empty-icon"><IconBook /></div>
            <h2>Bạn chưa tham gia khóa học nào</h2>
            <p>Hàng ngàn bài học chất lượng đang chờ đón bạn. Khám phá ngay!</p>
            <Link to="/courses" className="tz-mc-btn-primary">Tìm khóa học phù hợp</Link>
          </div>
        ) : (
          <div className="tz-mc-grid">
            {visibleEnrollments.map((enr) => {
              const course = enr.course;
              const catName = course.categoryRef?.name || course.categoryId;
              const colorClass = getCoverColorClass(catName);
              const coverText = getCoverInitials(catName, course.title);
              const progress = Math.round(enr.progress) || 0;

              return (
                <div key={enr._id} className="tz-mc-card">
                  {/* Cover Area */}
                  {course.thumbnail ? (
                    <div className="tz-mc-cover" style={{ backgroundImage: `url(${apiPath(course.thumbnail)})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                      <span className="tz-mc-badge-dark" style={{ position: 'absolute', top: '12px', left: '12px' }}>{catName || "Khóa học"}</span>
                      {enr.isTrial && <span className="tz-mc-badge-trial" style={{ position: 'absolute', top: '12px', right: '12px' }}>HỌC THỬ</span>}
                    </div>
                  ) : (
                    <div className={`tz-mc-cover ${colorClass}`}>
                      <div className="tz-mc-cover-text">{coverText}</div>
                      <span className="tz-mc-badge-dark">{catName || "Khóa học"}</span>
                      {enr.isTrial && <span className="tz-mc-badge-trial">HỌC THỬ</span>}
                    </div>
                  )}

                  {/* Info Area */}
                  <div className="tz-mc-body">
                    <h3 className="tz-mc-title" title={course.title}>{course.title}</h3>
                    
                    <div className="tz-mc-schedule">
                      <IconCalendar />
                      <span>{course.schedule || 'Sáng 3-5-7 | 9h-10h30'}</span>
                    </div>

                    <div className="tz-mc-progress-section">
                      <div className="tz-mc-progress-header">
                        <span>Tiến độ học tập</span>
                        <strong>{progress}%</strong>
                      </div>
                      <div className="tz-mc-progress-track">
                        <div className="tz-mc-progress-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Area */}
                  <div className="tz-mc-footer">
                    <button className="tz-mc-btn-learn" onClick={() => navigate(getCourseLearnPath(course))}>
                      <IconPlay /> Tiếp tục học
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
