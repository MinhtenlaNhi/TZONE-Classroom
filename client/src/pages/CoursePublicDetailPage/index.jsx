import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiFetchJson, apiFetch, apiPath } from "../../api/base";
import { addToCart } from "../../api/cartApi";
import { fetchCourseReviews } from "../../api/reviewsApi";
import { getAuth } from "../../auth/auth";
import StarRating from "../../components/StarRating";
import { getEnrollmentStatus, getEnrollmentClosedButtonLabel, isEnrollmentOpen } from "../../utils/enrollment";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import "../../pages/Home/styles.css";
import "./CoursePublicDetail.css";

export default function CoursePublicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();

  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const [resCourse, resReviews] = await Promise.all([
          apiFetchJson(`/api/courses/${id}`),
          fetchCourseReviews(id)
        ]);

        if (resCourse.success) {
          setCourse(resCourse.course);
        } else {
          setError(resCourse.message || "Không tìm thấy khóa học");
        }

        if (resReviews.success) {
          setReviews(resReviews.reviews || []);
        }
      } catch (err) {
        setError("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!auth) {
      navigate("/login", { state: { from: `/courses/${id}` } });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await addToCart(course.id || course._id);
      if (res.success) {
        toast.success("Đã thêm vào giỏ hàng");
        navigate("/cart");
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi khi thêm vào giỏ hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrial = async () => {
    if (!auth) {
      navigate("/login", { state: { from: `/courses/${id}` } });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await apiFetchJson(`/api/enrollments/course/${course.id || course._id}/trial`, {
        method: "POST"
      });

      if (res.success) {
        toast.success("Đăng ký học thử thành công!");
        navigate(`/learn/${course.id || course._id}`);
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi đăng ký học thử");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="course-public tz-home">
        <PublicHeader />
        <div className="course-detail-loading">
          <div className="spinner" style={{ borderColor: '#e2e8f0', borderTopColor: '#10b981', width: 40, height: 40, borderRadius: '50%', borderStyle: 'solid', borderWidth: 4, animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          Đang tải thông tin khóa học...
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-public tz-home">
        <PublicHeader />
        <div className="course-detail-error">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1" style={{ margin: '0 auto 1rem' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h2>{error || "Khóa học không tồn tại hoặc đã bị ẩn"}</h2>
          <Link to="/courses" className="btn-back">← Về danh sách khóa học</Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const enrollmentStatus = getEnrollmentStatus(course);
  const enrollmentOpen = isEnrollmentOpen(course);

  const catName = course.categoryRef?.name || course.categoryId || "Khác";

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
    if (name.includes("TOEIC B")) return "cp-cover-green";
    if (name.includes("TOEIC A")) return "cp-cover-blue";
    if (name.includes("TẬP SỰ")) return "cp-cover-orange";
    if (name.includes("SPEAKING")) return "cp-cover-blue";
    return "cp-cover-green"; // default original green
  };

  const colorClass = getCoverColorClass(catName);
  const coverText = getCoverInitials(catName, course.title);

  return (
    <div className="course-public tz-home">
      <PublicHeader />

      <div className="cp-container">
        {/* Breadcrumb */}
        <div className="cp-breadcrumb">
          <Link to="/courses" className="cp-back-link">← Trở về danh sách</Link>
          <span className="cp-breadcrumb-badge">{catName}</span>
        </div>

        {/* Hero Banner */}
        <div className="cp-hero-banner">
          <div className="cp-hero-content">
            <span className="cp-hero-badge">{catName}</span>
            <h1 className="cp-hero-title">{course.title}</h1>
            <div className="cp-hero-rating">
              <span className="score">{course.rating ? course.rating.toFixed(1) : "0.0"}</span>
              <StarRating rating={Math.round(course.rating || 0)} />
              <span className="count">({course.reviewCount || 0} đánh giá)</span>
            </div>
            <p className="cp-hero-desc">Khóa học {catName} chất lượng cao cùng {course.instructor}</p>
            <div className="cp-hero-meta">
              <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> {course.totalSessions || 8} buổi ({course.sessionDuration || 90} phút/buổi)</span>
            </div>
          </div>
          <div className="cp-hero-graphic">
            <img src={course.thumbnail ? apiPath(course.thumbnail) : "/images/course-team-collab.png"} alt="" onError={e => e.target.style.display = 'none'} style={course.thumbnail ? { borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '100%', transform: 'none' } : {}} />
          </div>
        </div>

        {/* Main Layout */}
        <div className="cp-layout">
          {/* Left Column */}
          <div className="cp-main-col">
            <div className="cp-section">
              <h2 className="cp-section-title">
                <span className="icon-wrapper"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></span>
                Giới thiệu khóa học
              </h2>
              <div className="cp-section-content" dangerouslySetInnerHTML={{ __html: course.description || "<p>Đây là mô tả chi tiết mẫu cho khóa học.</p><p>Khóa học sẽ giúp bạn đạt điểm cao trong kỳ thi sắp tới.</p>" }} />
            </div>

            <div className="cp-section">
              <h2 className="cp-section-title">
                <span className="icon-wrapper"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span>
                Lịch học & Khai giảng
              </h2>
              <div className="cp-schedule-box">
                <div className="cp-schedule-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span><strong>Ngày khai giảng dự kiến:</strong> {course.startDate || "Liên hệ"}</span>
                </div>
                <div className="cp-schedule-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span><strong>Lịch học trong tuần:</strong> {course.schedule || "Linh hoạt"}</span>
                </div>
              </div>
            </div>

            <div className="cp-section">
              <h2 className="cp-section-title">
                <span className="icon-wrapper"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span>
                Đánh giá từ Học viên
              </h2>
              {reviews.length === 0 ? (
                <p className="cp-no-reviews">Chưa có đánh giá nào cho khóa học này.</p>
              ) : (
                <div className="cp-reviews-list">
                  {reviews.map(rev => (
                    <div key={rev._id} className="cp-review-card">
                      <div className="reviewer-info">
                        <img
                          src={rev.userRef?.avatar ? apiPath(rev.userRef.avatar) : "/default-avatar.png"}
                          alt="avatar"
                          className="reviewer-avatar"
                          onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + (rev.userRef?.name || "U"); }}
                        />
                        <div className="reviewer-meta">
                          <strong>{rev.userRef?.name || "Học viên ẩn danh"}</strong>
                          <span className="review-date">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <div className="review-rating">
                        <StarRating rating={rev.rating} />
                      </div>
                      {rev.comment && <p className="review-comment">{rev.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="cp-sidebar-col">
            <div className="cp-buy-card">
              <div className="cp-buy-img-wrap">
                <span className={`cp-buy-status-badge cp-buy-status-badge--${enrollmentStatus.badgeVariant}`}>
                  {enrollmentStatus.badge}
                </span>
                {course.thumbnail ? (
                  <img src={apiPath(course.thumbnail)} alt={course.title} />
                ) : (
                  <div className={`cp-buy-img-placeholder ${colorClass}`}>
                    <span className="cp-buy-img-initials">{coverText}</span>
                  </div>
                )}
              </div>

              <div className="cp-buy-details">
                <div className="cp-buy-price">
                  {course.price ? (course.price.toString().includes('đ') ? course.price : `${Number(course.price).toLocaleString()}đ`) : "Miễn phí"}
                </div>

                <ul className="cp-buy-features">
                  <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Truy cập toàn bộ bài giảng trực tiếp</li>
                  <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> {course.trialLessonCount || 2} buổi học thử miễn phí</li>
                  <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Hỗ trợ giải đáp 24/7 từ giáo viên</li>
                  <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Tài liệu độc quyền TZONE</li>
                </ul>

                {enrollmentStatus.message ? (
                  <p className="cp-buy-enrollment-note">{enrollmentStatus.message}</p>
                ) : null}

                <div className="cp-buy-actions">
                  {enrollmentOpen ? (
                    <>
                      <button className="cp-btn-enroll" onClick={handleEnroll} disabled={isSubmitting}>
                        {isSubmitting ? "Đang xử lý..." : "Đăng ký học ngay"} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </button>
                      <button className="cp-btn-trial" onClick={handleTrial} disabled={isSubmitting}>
                        {isSubmitting ? "Đang xử lý..." : "Học thử miễn phí"} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                      </button>
                    </>
                  ) : (
                    <button className="cp-btn-closed" disabled>
                      {getEnrollmentClosedButtonLabel(enrollmentStatus)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
