import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchAdminReviews, toggleHideReview, deleteReview } from "../../api/reviewsApi";
import StarRating from "../../components/StarRating";
import { 
  FiSearch, FiFilter, FiCalendar, FiEye, FiEyeOff, 
  FiTrash2, FiCheckCircle, FiXCircle, FiExternalLink, FiChevronLeft, FiChevronRight, FiImage
} from "react-icons/fi";
import { apiPath } from "../../api/base";
import "./AdminReviews.css";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterCourseId, setFilterCourseId] = useState("");
  const [coursesFilterList, setCoursesFilterList] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadReviews();
  }, [filterCourseId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminReviews(filterCourseId);
      if (res.success) {
        setReviews(res.reviews || []);
        
        // Extract unique courses for filter dropdown
        if (!filterCourseId) {
          const uniqueCoursesMap = new Map();
          (res.reviews || []).forEach(r => {
            if (r.courseRef) uniqueCoursesMap.set(r.courseRef._id, r.courseRef.title);
          });
          const coursesList = Array.from(uniqueCoursesMap).map(([id, title]) => ({ id, title }));
          setCoursesFilterList(coursesList);
        }
      } else {
        toast.error("Lỗi lấy danh sách đánh giá.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHide = async (id, currentStatus) => {
    try {
      const res = await toggleHideReview(id);
      if (res.success) {
        toast.success(res.message);
        setReviews(reviews.map(r => r._id === id ? { ...r, isHidden: res.isHidden } : r));
      }
    } catch (e) {
      toast.error("Lỗi cập nhật trạng thái.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này vĩnh viễn? Hành động này sẽ cập nhật lại điểm trung bình của khóa học.")) return;
    
    try {
      const res = await deleteReview(id);
      if (res.success) {
        toast.success("Đã xóa đánh giá.");
        setReviews(reviews.filter(r => r._id !== id));
      }
    } catch (e) {
      toast.error("Lỗi xóa đánh giá.");
    }
  };

  const getAvatarInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  // Filter logic locally for search & status
  const filteredReviews = reviews.filter(r => {
    if (status === "public" && r.isHidden) return false;
    if (status === "hidden" && !r.isHidden) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = r.userRef?.name?.toLowerCase().includes(q);
      const matchEmail = r.userRef?.email?.toLowerCase().includes(q);
      const matchComment = r.comment?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchComment) return false;
    }
    return true;
  });

  return (
    <div className="admin-reviews-page">
      <div className="ar-header-section">
        <div className="ar-title-area">
          <div className="ar-title">
            <h1>Quản lý Đánh giá (Reviews)</h1>
            <p>Xem và quản lý các đánh giá của học viên dành cho khóa học.</p>
          </div>
          <div className="ar-title-actions">
            <div className="ar-select-wrapper">
              <FiFilter className="select-icon" />
              <select value={filterCourseId} onChange={e => setFilterCourseId(e.target.value)}>
                <option value="">Tất cả khóa học</option>
                {coursesFilterList.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="ar-filters-bar">
        <div className="ar-search-box">
          <input 
            type="text" 
            placeholder="Tìm kiếm đánh giá, học viên..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <FiSearch className="search-icon" />
        </div>
        <div className="ar-filter-actions">
          <div className="ar-select-wrapper status-select">
            <FiFilter className="select-icon" />
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="public">Công khai</option>
              <option value="hidden">Đang ẩn</option>
            </select>
          </div>
          <div className="ar-date-input">
            <FiCalendar className="date-icon" />
            <input type="text" placeholder="Chọn khoảng thời gian" readOnly />
            <FiChevronRight className="date-arrow" />
          </div>
        </div>
      </div>

      <div className="ar-content-box">
        {loading ? (
          <div className="ar-loading">Đang tải dữ liệu...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="ar-empty">Không có đánh giá nào phù hợp.</div>
        ) : (
          <div className="ar-table-container">
            <table className="ar-table">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Khóa học</th>
                  <th>Đánh giá</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((rev) => (
                  <tr key={rev._id} className={rev.isHidden ? "row-hidden" : ""}>
                    <td>
                      <div className="ar-user-cell">
                        <div className="ar-avatar">{getAvatarInitials(rev.userRef?.name)}</div>
                        <div className="ar-user-info">
                          <strong className="ar-user-name">{rev.userRef?.name || "Khách"}</strong>
                          <span className="ar-user-email">{rev.userRef?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="ar-course-cell">
                        <div className="ar-course-thumb">
                          {rev.courseRef?.thumbnail ? (
                            <img src={apiPath(rev.courseRef.thumbnail)} alt="thumb" />
                          ) : (
                            <FiImage />
                          )}
                        </div>
                        <div className="ar-course-info">
                          <strong className="ar-course-title">{rev.courseRef?.title}</strong>
                          <a href={`/courses/${rev.courseRef?._id}`} target="_blank" rel="noreferrer" className="ar-course-link">
                            Xem khóa học <FiExternalLink />
                          </a>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="ar-review-cell">
                        <div className="ar-rating">
                          <StarRating rating={rev.rating} />
                          <span className="ar-rating-text">({rev.rating} sao)</span>
                        </div>
                        {rev.comment && <p className="ar-comment">"{rev.comment}"</p>}
                        <span className="ar-date">
                          {new Date(rev.createdAt).toLocaleDateString("vi-VN")} • {new Date(rev.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </td>
                    <td>
                      {rev.isHidden ? (
                        <span className="badge badge-error"><FiXCircle className="badge-icon" /> Đang ẩn</span>
                      ) : (
                        <span className="badge badge-success"><FiCheckCircle className="badge-icon" /> Công khai</span>
                      )}
                    </td>
                    <td>
                      <div className="ar-actions">
                        <button 
                          className={`ar-btn ${rev.isHidden ? 'btn-show' : 'btn-hide'}`}
                          onClick={() => handleToggleHide(rev._id, rev.isHidden)}
                        >
                          {rev.isHidden ? <><FiEye /> Hiện đánh giá</> : <><FiEyeOff /> Ẩn đánh giá</>}
                        </button>
                        <button 
                          className="ar-btn btn-delete"
                          onClick={() => handleDelete(rev._id)}
                        >
                          <FiTrash2 /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredReviews.length > 0 && (
          <div className="ar-pagination-wrapper">
            <div className="ar-pagination-info">
              Hiển thị 1-{filteredReviews.length} trong {filteredReviews.length} kết quả
            </div>
            <div className="ar-pagination">
              <button className="ar-page-btn" disabled><FiChevronLeft /></button>
              <button className="ar-page-btn active">1</button>
              <button className="ar-page-btn" disabled><FiChevronRight /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
