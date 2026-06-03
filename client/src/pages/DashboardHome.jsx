import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchMyEnrollments } from "../api/enrollmentsApi";
import { getAuth } from "../auth/auth";
import { apiPath } from "../api/base";
import { getCourseLearnPath, getVisibleEnrollments } from "../utils/enrollments";
import "./DashboardHome.css";

// --- SVG Icons to match the design ---
function IconBook() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconAward() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconGraduation() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

export default function DashboardHome() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchMyEnrollments();
        if (res.success) {
          setEnrollments(res.enrollments);
        } else {
          toast.error("Lỗi tải thông tin tổng quan");
        }
      } catch (err) {
        toast.error("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const visibleEnrollments = getVisibleEnrollments(enrollments);
  const enrolledList = visibleEnrollments.filter((e) => !e.isTrial);
  const trialList = visibleEnrollments.filter((e) => e.isTrial);
  const totalCourses = enrolledList.length;
  const trialCount = trialList.length;
  const completedCourses = enrolledList.filter((e) => e.progress >= 100).length;
  const avgProgress =
    totalCourses > 0
      ? Math.round(enrolledList.reduce((sum, e) => sum + e.progress, 0) / totalCourses)
      : 0;

  const activeCourse =
    enrolledList.find((e) => e.progress < 100) ||
    enrolledList[0] ||
    trialList[0];

  if (loading) {
    return <div className="tz-dashboard-loading">Đang tải dữ liệu tổng quan...</div>;
  }

  return (
    <div className="tz-dashboard-overview">
      {/* Welcome Banner */}
      <div className="tz-do-banner">
        <div className="tz-do-banner-text">
          <h2>Chào mừng trở lại, {auth?.name?.split(' ').pop() || auth?.email?.split('@')[0] || "Học viên"}! 👋</h2>
          <p>Hôm nay là một ngày tuyệt vời để tiếp tục hành trình chinh phục mục tiêu của bạn.</p>
          
          <button 
            className="tz-btn-primary tz-banner-btn"
            onClick={() => {
              if (activeCourse?.course) {
                navigate(getCourseLearnPath(activeCourse.course));
              } else {
                navigate("/courses");
              }
            }}
          >
            Tiếp tục học ngay <IconArrowRight />
          </button>
        </div>
        <div className="tz-do-banner-illustration">
          <img src="/assets/header-graphic.png" alt="Student Illustration" onError={(e) => {
            // Thay thế bằng ảnh minh họa tương đương nếu không có sẵn
            e.target.src = 'https://cdni.iconscout.com/illustration/premium/thumb/online-learning-4487265-3738450.png';
          }} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="tz-do-stats">
        <div className="tz-do-stat-card">
          <div className="tz-do-stat-icon bg-green">
            <IconBook />
          </div>
          <div className="tz-do-stat-info">
            <h3>{totalCourses}</h3>
            <p className="tz-stat-label">Khóa học đã đăng ký</p>
            <p className="tz-stat-desc">
              {trialCount > 0
                ? `+ ${trialCount} khóa đang học thử`
                : "Tiếp tục cố gắng!"}
            </p>
          </div>
        </div>

        <div className="tz-do-stat-card">
          <div className="tz-do-stat-icon bg-blue">
            <IconCheckCircle />
          </div>
          <div className="tz-do-stat-info">
            <h3>{completedCourses}</h3>
            <p className="tz-stat-label">Khóa học hoàn thành</p>
            <p className="tz-stat-desc">Bạn đang tiến bộ!</p>
          </div>
        </div>

        <div className="tz-do-stat-card">
          <div className="tz-do-stat-icon bg-orange">
            <IconAward />
          </div>
          <div className="tz-do-stat-info">
            <h3>{avgProgress}%</h3>
            <p className="tz-stat-label">Tiến độ trung bình</p>
            <p className="tz-stat-desc">Cố lên, bạn sẽ đạt được!</p>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="tz-do-section">
        <div className="tz-do-section-header">
          <h2>Tiếp tục học</h2>
          <Link to="/my-courses" className="tz-link-more">Xem tất cả <IconArrowRight /></Link>
        </div>
        
        {visibleEnrollments.length === 0 ? (
          <div className="tz-do-empty">
            <div className="tz-do-empty-icon">📚</div>
            <h3>Bạn chưa có khóa học nào!</h3>
            <p>Khám phá các khóa học chất lượng để bắt đầu ngay hôm nay.</p>
            <Link to="/courses" className="tz-btn-primary mt-3">Khám phá khóa học</Link>
          </div>
        ) : (
          <div className="tz-do-course-grid">
            {[...enrolledList, ...trialList].slice(0, 4).map((enr) => {
              const course = enr.course;
              const progressStr = `${Math.round(enr.progress)}%`;
              const isTrial = !!enr.isTrial;

              return (
                <div
                  key={enr._id}
                  className={`tz-do-course-card ${isTrial ? "is-trial" : "is-enrolled"}`}
                >
                  <div className="tz-doc-cover">
                    {course.thumbnail ? (
                      <img src={apiPath(course.thumbnail)} alt={course.title} />
                    ) : (
                      <div className="tz-doc-placeholder">
                        <span className="tz-doc-placeholder-text">{course.title}</span>
                      </div>
                    )}
                    <span className="tz-doc-badge-category">
                      {course.categoryRef?.name || "Khóa học"}
                    </span>
                    <span
                      className={`tz-doc-badge-status ${isTrial ? "trial" : "enrolled"}`}
                      title={isTrial ? "Khóa học thử — chưa thanh toán" : "Khóa học đã đăng ký"}
                    >
                      {isTrial ? "HỌC THỬ" : "ĐÃ ĐĂNG KÝ"}
                    </span>
                  </div>

                  <div className="tz-doc-body">
                    <h3 className="tz-doc-title">{course.title}</h3>

                    {isTrial && (
                      <p className="tz-doc-trial-note">
                        Bạn đang học thử khóa này. Đăng ký để mở toàn bộ bài học.
                      </p>
                    )}

                    <div className="tz-doc-progress-container">
                      <div className="tz-doc-progress-info">
                        <span className="tz-progress-label">Tiến độ</span>
                        <span className="tz-progress-value">{progressStr}</span>
                      </div>
                      <div className="tz-doc-progress-bar">
                        <div
                          className={`tz-doc-progress-fill ${isTrial ? "is-trial" : ""}`}
                          style={{ width: progressStr }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="tz-doc-footer">
                    <button
                      onClick={() => navigate(getCourseLearnPath(course))}
                      className={`tz-btn-continue ${isTrial ? "tz-btn-continue-trial" : ""}`}
                    >
                      <IconPlay /> {isTrial ? "Tiếp tục học thử" : "Tiếp tục học"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Explore More Section */}
      <div className="tz-do-explore">
        <div className="tz-do-explore-icon">
          <IconGraduation />
        </div>
        <div className="tz-do-explore-content">
          <h2>Khám phá thêm kiến thức mới</h2>
          <p>Nâng cao kỹ năng của bạn với các khóa học mới nhất từ TZONE.</p>
        </div>
        <Link to="/courses" className="tz-btn-outline-green">Tìm khóa học mới <IconArrowRight /></Link>
      </div>
    </div>
  );
}
