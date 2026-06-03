import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchCourseLessons, updateCourseProgress } from "../../api/enrollmentsApi";
import { fetchAssignmentsByLesson } from "../../api/assignmentsApi";
import { fetchCourseLinks } from "../../api/courseLinks";
import { submitReview } from "../../api/reviewsApi";
import StarRating from "../../components/StarRating";
import "./LearningPage.css";

// SVG Icons
const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);
const IconCheckCircle = ({ checked }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={checked ? "#00a260" : "none"} stroke={checked ? "#00a260" : "#cbd5e1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    {checked && <polyline points="22 4 12 14.01 9 11.01" stroke="white" strokeWidth="3"></polyline>}
  </svg>
);
const IconVideo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);
const IconCalendar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const IconFile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const IconEdit = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const IconChevronDown = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);
const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

export default function LearningPage() {
  const { courseId } = useParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [courseMeetUrl, setCourseMeetUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // Helper function to format long filenames
  const formatFileName = (name) => {
    if (!name) return "Tài liệu đính kèm";
    if (name.length <= 30) return name;
    
    const extIndex = name.lastIndexOf('.');
    if (extIndex !== -1 && name.length - extIndex <= 6) {
      const ext = name.substring(extIndex);
      const base = name.substring(0, extIndex);
      return base.substring(0, 15) + "..." + base.substring(base.length - 5) + ext;
    }
    return name.substring(0, 25) + "...";
  };

  // States cho việc học
  const [activeSection, setActiveSection] = useState(1);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  
  // Assignment State
  const [assignments, setAssignments] = useState([]);

  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [res, linksData] = await Promise.all([
          fetchCourseLessons(courseId),
          fetchCourseLinks(courseId).catch(() => ({ links: [] }))
        ]);

        if (res.success) {
          setCourseInfo({
            title: res.courseTitle,
            isTrial: res.isTrial,
            progress: res.progress || 0
          });
          setHasReviewed(!!res.hasReviewed);
          setCurriculum(res.curriculum || []);
          if (linksData?.meetUrl) {
            setCourseMeetUrl(linksData.meetUrl);
          } else {
            setCourseMeetUrl("");
          }

          // Tự chọn bài học có thể học đầu tiên (ưu tiên bài không bị khóa).
          const sections = res.curriculum || [];
          let firstLesson = null;
          let firstSection = null;
          for (const sec of sections) {
            const open = (sec.lessons || []).find((l) => !l.locked);
            if (open) {
              firstLesson = open;
              firstSection = sec.sectionIndex;
              break;
            }
          }
          if (!firstLesson && sections[0]?.lessons?.length) {
            firstLesson = sections[0].lessons[0];
            firstSection = sections[0].sectionIndex;
          }
          if (firstLesson) {
            setActiveLesson(firstLesson);
            setActiveSection(firstSection);
            if (!firstLesson.locked) loadAssignments(firstLesson._id);
          }
        } else {
          toast.error(res.message || "Lỗi tải bài học");
        }
      } catch (err) {
        toast.error("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseId]);

  const calculateTotalLessons = () => {
    return curriculum.reduce((total, sec) => total + sec.lessons.length, 0);
  };

  const loadAssignments = async (lessonId) => {
    try {
      setAssignments([]);
      const res = await fetchAssignmentsByLesson(lessonId);
      if (res.success) {
        setAssignments(res.assignments || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLessonSelect = (lesson, sectionIndex) => {
    setActiveLesson(lesson);
    if (lesson.locked) {
      setAssignments([]);
      return;
    }
    loadAssignments(lesson._id);
  };

  const toggleSection = (sectionIndex) => {
    setActiveSection(prev => prev === sectionIndex ? null : sectionIndex);
  };

  const handleComplete = async () => {
    if (!activeLesson) return;

    const newCompleted = new Set(completedLessons);
    newCompleted.add(activeLesson._id);
    setCompletedLessons(newCompleted);

    const total = calculateTotalLessons();
    const newProgress = total > 0 ? (newCompleted.size / total) * 100 : 0;

    try {
      const res = await updateCourseProgress(courseId, newProgress);
      setCourseInfo(prev => ({ ...prev, progress: newProgress }));
      if (res?.certificateIssued) {
        toast.success(
          "🎉 Chúc mừng! Bạn đã hoàn thành 100% khóa học. Giấy chứng nhận đã được gửi về email của bạn.",
          { autoClose: 8000 }
        );
      } else {
        toast.success("Tuyệt vời! Đã lưu tiến độ.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      const res = await submitReview(courseId, rating, comment);
      if (res.success) {
        toast.success("Cảm ơn bạn đã gửi đánh giá!");
        setComment("");
        setHasReviewed(true);
        setShowReviewModal(false);
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi gửi đánh giá");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="tz-learning-loading">
        <div className="tz-spinner"></div>
        <p>Đang tải không gian học tập...</p>
      </div>
    );
  }

  const progressPercent = Math.round(courseInfo?.progress || 0);

  // Khóa học đã hoàn thành 100% (chỉ áp dụng cho học viên chính thức).
  // Khi đó: không học tiếp được nữa, chỉ xem lại tài liệu/video; mở nút đánh giá.
  const isCompleted = !courseInfo?.isTrial && progressPercent >= 100;

  const activeMeetUrl = courseMeetUrl || null;

  return (
    <div className="tz-learning-layout">
      {/* Sidebar */}
      <aside className="tz-learning-sidebar">
        <div className="tz-ls-header">
          <Link to="/dashboard" className="tz-ls-back">
            <IconArrowLeft /> Quay lại Dashboard
          </Link>
          <h2 className="tz-ls-course-title">{courseInfo?.title}</h2>
          {courseInfo?.isTrial && <span className="tz-ls-trial-badge">Đang học thử</span>}
          
          <div className="tz-ls-progress-container">
            <div className="tz-ls-progress-info">
              <span>Tiến độ học tập</span>
              <strong>{Math.round(courseInfo?.progress || 0)}%</strong>
            </div>
            <div className="tz-ls-progress-bar">
              <div className="tz-ls-progress-fill" style={{ width: `${courseInfo?.progress || 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="tz-ls-curriculum">
          {curriculum.length === 0 ? (
            <div className="tz-ls-empty">Khóa học đang được cập nhật bài học.</div>
          ) : (
            curriculum.map((section) => {
              const isOpen = activeSection === section.sectionIndex;
              return (
                <div className="tz-ls-section" key={section.sectionIndex}>
                  <div 
                    className={`tz-ls-section-header ${isOpen ? 'active' : ''}`}
                    onClick={() => toggleSection(section.sectionIndex)}
                  >
                    <div>
                      <h4 className="tz-ls-section-title">Chương {section.sectionIndex}: {section.sectionTitle}</h4>
                      <span className="tz-ls-section-meta">{section.lessons.length} bài học</span>
                    </div>
                    <IconChevronDown open={isOpen} />
                  </div>
                  
                  <div className={`tz-ls-section-body ${isOpen ? 'open' : ''}`}>
                    {section.lessons.map(lesson => {
                      const isActive = activeLesson?._id === lesson._id;
                      const isCompleted = completedLessons.has(lesson._id);
                      const isLocked = !!lesson.locked;
                      return (
                        <div 
                          key={lesson._id}
                          className={`tz-ls-lesson-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                          onClick={() => handleLessonSelect(lesson, section.sectionIndex)}
                        >
                          <div className="tz-ls-lesson-icon">
                            {isLocked ? <IconLock /> : <IconCheckCircle checked={isCompleted} />}
                          </div>
                          <span className="tz-ls-lesson-name">{lesson.title}</span>
                          {lesson.isFreePreview && <span className="tz-ls-preview-tag">Học thử</span>}
                          {isLocked && <span className="tz-ls-lock-tag"><IconLock /></span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Nút đánh giá — hiện ngay dưới các chương khi đã hoàn thành 100% */}
        {isCompleted && (
          <div className="tz-ls-review-cta">
            {hasReviewed ? (
              <div className="tz-ls-reviewed-note">
                <IconCheckCircle checked={true} /> Bạn đã đánh giá khóa học
              </div>
            ) : (
              <button className="tz-ls-review-btn" onClick={() => setShowReviewModal(true)}>
                <IconEdit /> Đánh giá khóa học
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="tz-learning-main">
        <div className="tz-lm-container">
          {activeLesson ? (
            activeLesson.locked ? (
              <div className="tz-lm-locked-panel">
                <div className="tz-lm-locked-panel-icon"><IconLock /></div>
                <h2 className="tz-lm-locked-panel-title">Bài học chỉ dành cho học viên đã đăng ký</h2>
                <p className="tz-lm-locked-panel-desc">
                  Bạn đang ở chế độ <strong>học thử</strong>. Bài “{activeLesson.title}” chưa được mở cho học thử.
                  Hãy đăng ký khóa học để mở khóa toàn bộ bài học, tài liệu và lớp học trực tuyến.
                </p>
                <Link to={`/courses/${courseId}`} className="tz-lm-locked-panel-btn">
                  Đăng ký khóa học để mở khóa
                </Link>
              </div>
            ) : (
            <>
              <div className="tz-lm-lesson-header">
                {activeLesson.isFreePreview && <span className="tz-lm-preview-badge">Bài học miễn phí (Học thử)</span>}
                <h1 className="tz-lm-lesson-title">{activeLesson.title}</h1>
              </div>

              {isCompleted && (
                <div className="tz-lm-completed-banner">
                  <IconCheckCircle checked={true} />
                  <div>
                    <strong>Bạn đã hoàn thành khóa học này.</strong>
                    <span>Khóa học đã kết thúc — bạn chỉ có thể xem lại tài liệu và video các buổi học.</span>
                  </div>
                </div>
              )}

              {!isCompleted && (
                <div className="tz-lm-cards-grid">
                  {/* Lịch học Card */}
                  <div className="tz-lm-card">
                    <div className="tz-lm-card-icon bg-blue"><IconCalendar /></div>
                    <div className="tz-lm-card-content">
                      <h3>Thời gian diễn ra</h3>
                      <p>{activeLesson.date ? new Date(activeLesson.date).toLocaleString("vi-VN") : "Chưa cập nhật thời gian"}</p>
                    </div>
                  </div>

                  {/* Phòng học Card */}
                  <div className="tz-lm-card">
                    <div className="tz-lm-card-icon bg-green"><IconVideo /></div>
                    <div className="tz-lm-card-content">
                      <h3>Phòng học Trực tuyến</h3>
                      {courseInfo?.isTrial ? (
                        <p className="tz-lm-no-link">
                          <IconLock /> Vào lớp trực tuyến chỉ dành cho học viên đã đăng ký. Hãy đăng ký khóa học để tham gia lớp.
                        </p>
                      ) : activeMeetUrl ? (
                        <a href={activeMeetUrl} target="_blank" rel="noreferrer" className="tz-lm-btn-meet">
                          <IconVideo /> Vào lớp Google Meet
                        </a>
                      ) : (
                        <p className="tz-lm-no-link">Giảng viên chưa thiết lập link phòng học cho khóa này.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Video ghi hình buổi học (xem lại) */}
              {activeLesson.materials && activeLesson.materials.some((m) => m.kind === "video") && (
                <div className="tz-lm-section">
                  <h3 className="tz-lm-section-title"><IconFile /> Video buổi học (xem lại)</h3>
                  <div className="tz-lm-recordings">
                    {activeLesson.materials
                      .filter((m) => m.kind === "video")
                      .map((mat, idx) => (
                        <div key={idx} className="tz-lm-recording">
                          <div className="tz-lm-recording-title" title={mat.title || "Video buổi học"}>
                            {formatFileName(mat.title)}
                          </div>
                          <video className="tz-lm-recording-player" src={mat.url} controls preload="metadata" />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Tài liệu đính kèm */}
              {activeLesson.materials && activeLesson.materials.some((m) => m.kind !== "video") && (
                <div className="tz-lm-section">
                  <h3 className="tz-lm-section-title"><IconFile /> Tài liệu bài học</h3>
                  <div className="tz-lm-materials-grid">
                    {activeLesson.materials
                      .filter((m) => m.kind !== "video")
                      .map((mat, idx) => (
                        <a key={idx} href={mat.url} target="_blank" rel="noreferrer" className="tz-lm-material-card">
                          <div className="tz-lm-material-icon">
                            <IconFile />
                          </div>
                          <div className="tz-lm-material-info">
                            <span className="tz-lm-material-name" title={mat.title || "Tài liệu đính kèm"}>
                              {formatFileName(mat.title)}
                            </span>
                            <span className="tz-lm-material-action">Tải xuống</span>
                          </div>
                        </a>
                      ))}
                  </div>
                </div>
              )}

              {/* Khi đã hoàn thành mà bài học chưa có tài liệu nào để xem lại */}
              {isCompleted && !(activeLesson.materials && activeLesson.materials.length > 0) && (
                <div className="tz-lm-section">
                  <p className="tz-lm-no-link">Bài học này chưa có tài liệu hoặc video để xem lại.</p>
                </div>
              )}

              {/* Bài tập */}
              {!isCompleted && assignments.length > 0 && (
                <div className="tz-lm-section">
                  <h3 className="tz-lm-section-title"><IconEdit /> Bài tập về nhà</h3>
                  <div className="tz-lm-assignments-list">
                    {assignments.map(ass => (
                      <div className="tz-lm-assignment-wrapper" key={ass._id}>
                        <div className="tz-lm-assignment-card">
                          <div className="tz-lm-ass-info">
                            <span className={`tz-lm-ass-type ${ass.type === 'quiz' ? 'bg-orange' : 'bg-blue'}`}>
                              {ass.type === 'quiz' ? 'Trắc nghiệm' : 'Tự luận'}
                            </span>
                            <span className="tz-lm-ass-title">{ass.title}</span>
                          </div>
                          <Link to={`/learn/${courseId}/assignment/${ass._id}`} className={`tz-lm-btn-do-task ${ass.mySubmission ? 'done' : ''}`}>
                            {ass.mySubmission ? "Xem lại bài" : "Làm bài ngay"}
                          </Link>
                        </div>
                        {ass.mySubmission && (
                          <div className="tz-lm-ass-status-bar">
                            <IconCheckCircle checked={true} />
                            {ass.type === 'quiz' ? (
                              <span className="tz-lm-ass-status-text">
                                Đã hoàn thành - <strong>Điểm: {ass.mySubmission.score}/100</strong>
                              </span>
                            ) : (
                              <span className="tz-lm-ass-status-text">
                                {ass.mySubmission.status === 'graded' ? (
                                  <>Đã chấm điểm - <strong>Điểm: {ass.mySubmission.score}/100</strong></>
                                ) : (
                                  "Đã nộp bài - Đang chờ giảng viên chấm"
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nút hoàn thành — ẩn khi đã hoàn thành toàn bộ khóa học */}
              {!isCompleted && (
                <div className="tz-lm-complete-section">
                  <button 
                    className={`tz-lm-btn-complete ${completedLessons.has(activeLesson._id) ? 'completed' : ''}`}
                    onClick={handleComplete}
                    disabled={completedLessons.has(activeLesson._id)}
                  >
                    <IconCheckCircle checked={completedLessons.has(activeLesson._id)} />
                    {completedLessons.has(activeLesson._id) ? "Đã hoàn thành bài học này" : "Đánh dấu hoàn thành"}
                  </button>
                </div>
              )}
            </>
            )
          ) : (
            <div className="tz-lm-empty-state">
              <div className="tz-lm-empty-icon">📚</div>
              <h2>Chọn bài học để bắt đầu</h2>
              <p>Hãy chọn một bài học trong menu bên trái để xem nội dung, link học trực tuyến và bài tập nhé.</p>
            </div>
          )}

        </div>
      </main>

      {/* Modal đánh giá khóa học (mở từ nút dưới các chương) */}
      {showReviewModal && (
        <div className="tz-lm-review-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="tz-lm-review-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="tz-lm-review-close"
              onClick={() => setShowReviewModal(false)}
              aria-label="Đóng"
            >
              ×
            </button>

            <div className="tz-lm-review-modal-head">
              <div className="tz-lm-review-modal-emoji">⭐</div>
              <h3>Đánh giá khóa học</h3>
              <p>Bạn chỉ có thể đánh giá <strong>một lần duy nhất</strong>. Hãy chia sẻ cảm nhận của bạn nhé!</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="tz-lm-review-form">
              <div className="tz-lm-rating-block">
                <span className="tz-lm-rating-label">Mức độ hài lòng của bạn</span>
                <div className="tz-lm-rating-stars">
                  <StarRating rating={rating} setRating={setRating} interactive={true} />
                </div>
              </div>

              <textarea
                className="tz-lm-textarea"
                rows="4"
                placeholder="Khóa học này như thế nào? Giảng viên dạy ra sao?..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              ></textarea>

              <div className="tz-lm-review-actions">
                <button type="button" className="tz-lm-btn-cancel" onClick={() => setShowReviewModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="tz-lm-btn-submit" disabled={submittingReview}>
                  {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
