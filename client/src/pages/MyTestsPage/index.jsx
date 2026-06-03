import { useEffect, useState } from "react";
import { fetchAllMySubmissions } from "../../api/assignmentsApi";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiClock, FiFileText } from "react-icons/fi";
import { toast } from "react-toastify";
import "./MyTestsPage.css";

export default function MyTestsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const res = await fetchAllMySubmissions();
      if (res.success) {
        setSubmissions(res.submissions);
      } else {
        toast.error("Lỗi tải lịch sử bài kiểm tra.");
      }
    } catch (err) {
      toast.error("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="mt-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="mt-page">
      <div className="mt-header">
        <h1>Các bài kiểm tra của tôi</h1>
        <p>Lịch sử làm bài trắc nghiệm và tự luận</p>
      </div>

      {submissions.length === 0 ? (
        <div className="mt-empty">
          <p>Bạn chưa hoàn thành bài kiểm tra nào.</p>
          <Link to="/my-courses" className="btn-primary">Quay lại khóa học</Link>
        </div>
      ) : (
        <div className="mt-grid">
          {submissions.map((sub) => {
            const assignment = sub.assignmentRef;
            const course = assignment?.courseRef;
            if (!assignment || !course) return null;

            return (
              <div className="mt-card" key={sub._id}>
                <div className="mt-card-header">
                  <div className="mt-type-badge">
                    {sub.type === "quiz" ? (
                      <span className="badge-quiz"><FiCheckCircle /> Trắc nghiệm</span>
                    ) : (
                      <span className="badge-essay"><FiFileText /> Tự luận</span>
                    )}
                  </div>
                  <div className="mt-date">
                    Nộp: {new Date(sub.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>

                <div className="mt-card-body">
                  <h3 className="mt-assignment-title" title={assignment.title}>
                    {assignment.title}
                  </h3>
                  <div className="mt-course-title">
                    Khóa học: <Link to={`/courses/${course._id}`}>{course.title}</Link>
                  </div>
                </div>

                <div className="mt-card-footer">
                  <div className="mt-status-score">
                    {sub.status === "graded" ? (
                      <div className="mt-score">
                        <span className="score-label">Điểm số:</span>
                        <span className={`score-value ${sub.score >= 50 ? 'pass' : 'fail'}`}>
                          {sub.score}/100
                        </span>
                      </div>
                    ) : (
                      <div className="mt-status-pending">
                        <FiClock /> Chờ GV chấm điểm
                      </div>
                    )}
                  </div>
                  <Link 
                    to={`/learn/${course._id}/assignment/${assignment._id}`} 
                    className="mt-view-btn"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
