import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchAssignmentSubmissions, fetchLessonSubmissions, gradeSubmission } from "../../api/teacherApi";
import { toast } from "react-toastify";
import "./TeacherSubmissions.css";
import { apiPath } from "../../api/base";

// SVG Icons
const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);
const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const IconFileText = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const IconInbox = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
);

export default function TeacherSubmissionsPage() {
  const { lessonId, assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showGradeModal, setShowGradeModal] = useState(false);
  const [activeSub, setActiveSub] = useState(null);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadSubmissions();
  }, [lessonId, assignmentId]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const res = assignmentId
        ? await fetchAssignmentSubmissions(assignmentId)
        : await fetchLessonSubmissions(lessonId);
      if (res.success) {
        setSubmissions(res.submissions);
        setAssignment(res.assignment || null);
      }
    } catch (e) {
      toast.error("Lỗi lấy danh sách bài nộp");
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    try {
      const res = await gradeSubmission(activeSub._id, score, comment);
      if (res.success) {
        toast.success("Chấm điểm thành công");
        setShowGradeModal(false);
        loadSubmissions();
      }
    } catch {
      toast.error("Lỗi chấm điểm");
    }
  };

  const pendingCount = submissions.filter(s => s.status !== "graded").length;

  return (
    <div className="tz-ts-page">
      <div className="tz-ts-container">
        
        {/* Back Link */}
        <button onClick={() => window.history.back()} className="tz-ts-back">
          <IconArrowLeft /> Quay lại
        </button>

        {/* Header */}
        <header className="tz-ts-header">
          <div className="tz-ts-header-meta">
            <span className="tz-ts-badge-blue">
              {assignment ? assignment.title : "Bài Tập Của Học Viên"}
            </span>
            {assignment && (
              <span className={`tz-ts-type-badge ${assignment.type === "essay" ? "essay" : "quiz"}`}>
                {assignment.type === "essay" ? "Tự luận" : "Trắc nghiệm"}
              </span>
            )}
          </div>
          <div className="tz-ts-header-main">
            <h1 className="tz-ts-title">
              {assignment ? `Chấm bài: ${assignment.title}` : "Quản lý chấm điểm"}
            </h1>
            <div className="tz-ts-stats">
              <div className="tz-ts-stat-item">
                <span className="label">Tổng bài nộp</span>
                <span className="value">{submissions.length}</span>
              </div>
              <div className="tz-ts-stat-item highlight">
                <span className="label">Chưa chấm</span>
                <span className="value">{pendingCount}</span>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="tz-ts-loading">
            <div className="tz-spinner"></div>
            <p>Đang tải danh sách bài nộp...</p>
          </div>
        ) : (
          <div className="tz-ts-content">
            {submissions.length === 0 ? (
              <div className="tz-ts-empty">
                <IconInbox />
                <h3>Chưa có bài nộp nào</h3>
                <p>Hiện tại chưa có học viên nào nộp bài tập này.</p>
              </div>
            ) : (
              <div className="tz-ts-table-wrapper">
                <table className="tz-ts-table">
                  <thead>
                    <tr>
                      <th>Học viên</th>
                      <th>Loại bài</th>
                      <th>Nội dung nộp</th>
                      <th>Ngày nộp</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(sub => (
                      <tr key={sub._id}>
                        <td>
                          <div className="tz-ts-user-cell">
                            <div className="tz-ts-avatar">
                              {(sub.studentRef?.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="tz-ts-user-info">
                              <strong>{sub.studentRef?.name || "Ẩn danh"}</strong>
                              <span>{sub.studentRef?.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`tz-ts-type-badge ${sub.type === 'essay' ? 'essay' : 'quiz'}`}>
                            {sub.type === "essay" ? "Tự luận" : "Trắc nghiệm"}
                          </span>
                          {!assignment && sub.assignmentRef?.title && (
                            <div style={{fontSize: "0.8rem", color: "#64748b", marginTop: "4px"}}>
                              {sub.assignmentRef.title}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="tz-ts-submission-preview">
                            {sub.type === "essay" ? (
                              <>
                                {sub.fileUrl && (
                                  <a href={`${apiPath(sub.fileUrl)}`} target="_blank" rel="noreferrer" className="tz-ts-file-link">
                                    <IconFileText /> Tải file đính kèm
                                  </a>
                                )}
                                {sub.textContent && (
                                  <p className="tz-ts-text-preview">"{sub.textContent.length > 40 ? sub.textContent.slice(0, 40) + "..." : sub.textContent}"</p>
                                )}
                              </>
                            ) : (
                              <span className="tz-ts-text-muted">Chấm tự động</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="tz-ts-date">{new Date(sub.createdAt).toLocaleString("vi-VN")}</span>
                        </td>
                        <td>
                          {sub.status === "graded" ? (
                            <span className="tz-ts-status graded">
                              <IconCheckCircle /> Đã chấm ({sub.score}/100)
                            </span>
                          ) : (
                            <span className="tz-ts-status pending">
                              <IconClock /> Chờ chấm
                            </span>
                          )}
                        </td>
                        <td>
                          <button 
                            className={`tz-ts-btn-action ${sub.status === 'graded' ? 'outline' : 'primary'}`}
                            onClick={() => { 
                              setActiveSub(sub); 
                              setScore(sub.score || 0); 
                              setComment(sub.teacherComment || ""); 
                              setShowGradeModal(true); 
                            }}
                          >
                            {sub.status === "graded" ? "Sửa điểm" : "Chấm Bài"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Grade Modal */}
        {showGradeModal && (
          <div className="tz-ts-modal-overlay" onClick={() => setShowGradeModal(false)}>
            <div className="tz-ts-modal" onClick={e => e.stopPropagation()}>
              <div className="tz-ts-modal-header">
                <h2>Chấm bài: {activeSub?.studentRef?.name}</h2>
                <button onClick={() => setShowGradeModal(false)} className="tz-ts-modal-close">&times;</button>
              </div>
              <div className="tz-ts-modal-body">
                {activeSub?.type === "essay" && (
                  <div className="tz-ts-student-work">
                    <h4>Nội dung học viên làm bài:</h4>
                    {activeSub.textContent ? (
                      <div className="tz-ts-work-text">{activeSub.textContent}</div>
                    ) : (
                      <div className="tz-ts-work-empty">Học viên không nhập văn bản.</div>
                    )}
                    {activeSub.fileUrl && (
                      <a href={`${apiPath(activeSub.fileUrl)}`} target="_blank" rel="noreferrer" className="tz-ts-work-file">
                        <IconFileText /> Tải file đính kèm của học viên
                      </a>
                    )}
                  </div>
                )}
                
                <form onSubmit={handleGrade} className="tz-ts-grade-form">
                  <div className="tz-ts-form-group">
                    <label>Chấm điểm (Thang 100)</label>
                    <div className="tz-ts-score-input-wrapper">
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        required 
                        value={score} 
                        onChange={e => setScore(e.target.value)} 
                        className="tz-ts-score-input"
                      />
                      <span className="tz-ts-score-suffix">/ 100</span>
                    </div>
                  </div>
                  <div className="tz-ts-form-group">
                    <label>Nhận xét cho học viên</label>
                    <textarea 
                      rows="4" 
                      value={comment} 
                      onChange={e => setComment(e.target.value)}
                      placeholder="Góp ý để học viên cải thiện (không bắt buộc)..."
                      className="tz-ts-comment-input"
                    ></textarea>
                  </div>
                  <button type="submit" className="tz-ts-btn-submit full-width">Lưu Điểm</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
