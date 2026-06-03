import { useEffect, useState } from "react";
import { fetchMyReviews } from "../../api/reviewsApi";
import { Link } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import { toast } from "react-toastify";
import "./MyReviewsPage.css";
import { apiPath } from "../../api/base";

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const res = await fetchMyReviews();
      if (res.success) {
        setReviews(res.reviews);
      } else {
        toast.error("Lỗi tải danh sách đánh giá.");
      }
    } catch (err) {
      toast.error("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar 
          key={i} 
          className={`review-star ${i <= rating ? "filled" : "empty"}`} 
        />
      );
    }
    return stars;
  };

  if (loading) {
    return <div className="mr-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="mr-page">
      <div className="mr-header">
        <h1>Đánh giá của tôi</h1>
        <p>Lịch sử những đóng góp của bạn cho khóa học</p>
      </div>

      {reviews.length === 0 ? (
        <div className="mr-empty">
          <p>Bạn chưa viết đánh giá nào.</p>
          <Link to="/my-courses" className="btn-primary">Quay lại khóa học</Link>
        </div>
      ) : (
        <div className="mr-grid">
          {reviews.map((review) => {
            const course = review.courseRef;
            if (!course) return null;

            return (
              <div className="mr-card" key={review._id}>
                <div className="mr-card-course">
                  <div className="mr-course-img-wrapper">
                    {course.thumbnail ? (
                      <img 
                        src={`${apiPath(course.thumbnail)}`} 
                        alt={course.title} 
                      />
                    ) : (
                      <div className="mr-course-img-placeholder">TZONE</div>
                    )}
                  </div>
                  <div className="mr-course-info">
                    <Link to={`/courses/${course._id}`} className="mr-course-title">
                      {course.title}
                    </Link>
                    <div className="mr-date">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>

                <div className="mr-card-body">
                  <div className="mr-rating">
                    {renderStars(review.rating)}
                  </div>
                  <div className="mr-comment">
                    {review.comment ? (
                      <p>"{review.comment}"</p>
                    ) : (
                      <p className="mr-no-comment">Không có nội dung bình luận</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
