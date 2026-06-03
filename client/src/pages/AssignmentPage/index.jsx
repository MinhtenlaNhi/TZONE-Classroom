import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchAssignmentDetail, submitAssignment, fetchMySubmission } from "../../api/assignmentsApi";
import "./AssignmentPage.css";
import { apiPath } from "../../api/base";

// SVG Icons
const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);
const IconCheckCircle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#10b981" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const IconXCircle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#ef4444" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);
const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const IconUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);

export default function AssignmentPage() {
  const { courseId, id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // States cho Quiz
  const [answers, setAnswers] = useState([]); 
  
  // States cho Essay
  const [textContent, setTextContent] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const resA = await fetchAssignmentDetail(id);
        if (resA.success) {
          setAssignment(resA.assignment);
          if (resA.assignment.type === 'quiz') {
            setAnswers(new Array(resA.assignment.questions.length).fill(null));
          }
        } else {
          toast.error(resA.message || "Lỗi tải bài tập");
          setLoading(false);
          return;
        }

        const resS = await fetchMySubmission(id);
        if (resS.success && resS.submission) {
          setSubmission(resS.submission);
        }
      } catch (err) {
        toast.error("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleQuizChange = (qIndex, optIndex) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optIndex;
    setAnswers(newAnswers);
  };

  const handleQuizSubmit = async () => {
    if (answers.includes(null)) {
      if (!window.confirm("Bạn chưa trả lời hết các câu hỏi. Bạn có chắc muốn nộp bài?")) {
        return;
      }
    }
    try {
      setSubmitting(true);
      const res = await submitAssignment(id, { answers }, false);
      if (res.success) {
        toast.success("Tuyệt vời! Đã nộp bài thành công.");
        setSubmission(res.submission);
        // Tải lại assignment để lấy được correctAnswerIndex
        const resA = await fetchAssignmentDetail(id);
        if (resA.success) setAssignment(resA.assignment);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEssaySubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];
    
    if (!textContent.trim() && !file) {
      toast.error("Vui lòng nhập nội dung hoặc tải lên một tệp.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("textContent", textContent);
      if (file) formData.append("file", file);

      const res = await submitAssignment(id, formData, true);
      if (res.success) {
        toast.success("Nộp bài tự luận thành công!");
        setSubmission(res.submission);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="tz-ap-loading">
        <div className="tz-spinner"></div>
        <p>Đang chuẩn bị đề bài...</p>
      </div>
    );
  }
  if (!assignment) return <div className="tz-ap-loading">Không tìm thấy bài tập.</div>;

  const renderQuizMode = () => {
    const isDone = !!submission;

    return (
      <div className="tz-ap-quiz-container">
        {isDone && (
          <div className="tz-ap-score-card">
            <div className="tz-ap-score-circle">
              <span className="tz-ap-score-number">{submission.score}</span>
              <span className="tz-ap-score-max">/ 100</span>
            </div>
            <div className="tz-ap-score-info">
              <h2>Đã hoàn thành bài kiểm tra</h2>
              <p>Bạn có thể xem lại chi tiết từng câu hỏi và đáp án ở bên dưới để rút kinh nghiệm nhé.</p>
            </div>
          </div>
        )}

        <div className="tz-ap-questions-list">
          {assignment.questions.map((q, qIndex) => {
            const userChoice = isDone ? submission.answers[qIndex] : answers[qIndex];
            const isCorrect = isDone && userChoice === q.correctAnswerIndex;
            const isWrong = isDone && userChoice !== q.correctAnswerIndex && userChoice !== null;
            const unAnswered = isDone && userChoice === null;

            return (
              <div key={qIndex} className={`tz-ap-question-card ${isDone ? (isCorrect ? 'correct' : 'wrong') : ''}`}>
                <div className="tz-ap-q-header">
                  <span className="tz-ap-q-num">Câu {qIndex + 1}</span>
                  {isDone && isCorrect && <span className="tz-ap-q-badge badge-correct"><IconCheckCircle /> Chính xác</span>}
                  {isDone && isWrong && <span className="tz-ap-q-badge badge-wrong"><IconXCircle /> Sai</span>}
                  {isDone && unAnswered && <span className="tz-ap-q-badge badge-wrong"><IconXCircle /> Bỏ trống</span>}
                </div>
                
                <h4 className="tz-ap-q-text">{q.questionText}</h4>
                
                <div className="tz-ap-options-list">
                  {q.options.map((opt, optIndex) => {
                    let optClass = "tz-ap-option-item";
                    let isChecked = userChoice === optIndex;
                    
                    if (isDone) {
                      if (optIndex === q.correctAnswerIndex) optClass += " correct-opt";
                      else if (optIndex === userChoice && isWrong) optClass += " wrong-opt";
                      optClass += " disabled";
                    }

                    return (
                      <label key={optIndex} className={optClass}>
                        <div className="tz-ap-radio-wrapper">
                          <input 
                            type="radio" 
                            name={`q-${qIndex}`} 
                            value={optIndex}
                            checked={isChecked}
                            onChange={() => handleQuizChange(qIndex, optIndex)}
                            disabled={isDone}
                          />
                          <span className="tz-ap-radio-mark"></span>
                        </div>
                        <span className="tz-ap-opt-text">{opt}</span>
                      </label>
                    );
                  })}
                </div>
                
                {isDone && q.explanation && (
                  <div className="tz-ap-explanation">
                    <strong className="tz-ap-exp-title">Giải thích:</strong>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!isDone && (
          <div className="tz-ap-action-bar">
            <div className="tz-ap-action-content">
              <span>Bạn đã trả lời {answers.filter(a => a !== null).length} / {assignment.questions.length} câu hỏi.</span>
              <button className="tz-ap-btn-submit" onClick={handleQuizSubmit} disabled={submitting}>
                {submitting ? "Đang xử lý..." : "Nộp bài kiểm tra"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEssayMode = () => {
    const isDone = !!submission;

    if (isDone) {
      return (
        <div className="tz-ap-essay-result">
          <div className={`tz-ap-status-banner ${submission.status === 'graded' ? 'graded' : 'pending'}`}>
            <div className="tz-ap-status-icon">
              {submission.status === 'graded' ? <IconCheckCircle /> : <IconClock />}
            </div>
            <div className="tz-ap-status-text">
              <h3>{submission.status === 'graded' ? 'Đã chấm điểm' : 'Đang chờ chấm điểm'}</h3>
              <p>{submission.status === 'graded' 
                ? 'Giảng viên đã chấm bài và để lại nhận xét cho bạn.' 
                : 'Bài của bạn đã được ghi nhận. Vui lòng chờ giảng viên chấm điểm.'}
              </p>
            </div>
          </div>
          
          {submission.status === 'graded' && (
            <div className="tz-ap-grade-card">
              <div className="tz-ap-grade-score">
                <span className="label">Điểm số</span>
                <span className="value">{submission.score} <small>/ 100</small></span>
              </div>
              {submission.teacherComment && (
                <div className="tz-ap-grade-comment">
                  <strong>Nhận xét từ Giảng viên:</strong>
                  <p>{submission.teacherComment}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="tz-ap-submission-view">
            <h4>Bài làm của bạn:</h4>
            {submission.textContent && (
              <div className="tz-ap-sub-text">{submission.textContent}</div>
            )}
            {submission.fileUrl && (
              <a href={`${apiPath(submission.fileUrl)}`} target="_blank" rel="noreferrer" className="tz-ap-sub-file">
                <IconUpload /> Tải file đính kèm đã nộp
              </a>
            )}
          </div>
        </div>
      );
    }

    return (
      <form className="tz-ap-essay-form" onSubmit={handleEssaySubmit}>
        <div className="tz-ap-instruction">
          <h3 className="tz-ap-inst-title">Yêu cầu đề bài</h3>
          <div className="tz-ap-inst-content" dangerouslySetInnerHTML={{ __html: assignment.essayDescription }} />
        </div>
        
        <div className="tz-ap-form-group">
          <label>Nhập nội dung bài làm:</label>
          <textarea 
            className="tz-ap-textarea"
            rows="10" 
            placeholder="Gõ nội dung bài viết của bạn vào đây..." 
            value={textContent}
            onChange={e => setTextContent(e.target.value)}
          ></textarea>
        </div>

        <div className="tz-ap-form-group">
          <label>Hoặc nộp file đính kèm (Word/PDF/Ảnh):</label>
          <div className="tz-ap-file-upload">
            <input 
              type="file" 
              ref={fileInputRef} 
              id="file-upload" 
              className="tz-ap-file-input" 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setSelectedFileName(file.name);
                else setSelectedFileName("");
              }}
            />
            <label htmlFor="file-upload" className="tz-ap-file-label">
              <IconUpload /> {selectedFileName ? "Đổi tệp khác" : "Chọn tệp từ máy tính"}
            </label>
            {selectedFileName && (
              <div className="tz-ap-selected-file">
                <IconCheckCircle />
                <strong>Đã đính kèm:</strong> {selectedFileName}
              </div>
            )}
            {!selectedFileName && <span className="tz-ap-file-hint">Hỗ trợ .doc, .pdf, .jpg, .png</span>}
          </div>
        </div>

        <div className="tz-ap-action-bar">
          <div className="tz-ap-action-content">
            <span>Hãy kiểm tra kỹ bài làm trước khi nộp nhé!</span>
            <button type="submit" className="tz-ap-btn-submit" disabled={submitting}>
              {submitting ? "Đang tải lên..." : "Nộp bài tự luận"}
            </button>
          </div>
        </div>
      </form>
    );
  };

  return (
    <div className="tz-assignment-page">
      <div className="tz-ap-container">
        <Link to={`/learn/${courseId}`} className="tz-ap-back">
          <IconArrowLeft /> Quay lại không gian học
        </Link>

        <div className="tz-ap-header">
          <div className="tz-ap-header-meta">
            <span className={`tz-ap-badge ${assignment.type === 'quiz' ? 'bg-orange' : 'bg-blue'}`}>
              {assignment.type === 'quiz' ? 'Trắc nghiệm' : 'Tự luận'}
            </span>
            {assignment.dueDate && (
              <span className="tz-ap-due-date">
                <IconClock /> Hạn nộp: {new Date(assignment.dueDate).toLocaleString('vi-VN')}
              </span>
            )}
          </div>
          <h1 className="tz-ap-title">{assignment.title}</h1>
        </div>

        <div className="tz-ap-body">
          {assignment.type === "quiz" ? renderQuizMode() : renderEssayMode()}
        </div>
      </div>
    </div>
  );
}
