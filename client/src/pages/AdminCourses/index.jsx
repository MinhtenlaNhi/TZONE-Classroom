import { useEffect, useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchAdminCoursesV2, deleteAdminCourseV2 } from "../../api/adminCoursesApi";
import { fetchDashboardStats } from "../../api/adminApi";
import { getAuth } from "../../auth/auth";
import "./AdminCourses.css";
import { apiPath } from "../../api/base";

export default function AdminCoursesPage() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  // Fake pagination and filters for UI
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  if (!auth || (auth.role !== "admin" && auth.role !== "operation")) {
    return <Navigate to="/" replace />;
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, statsRes] = await Promise.all([
        fetchAdminCoursesV2(),
        fetchDashboardStats()
      ]);
      if (coursesRes.success) {
        setCourses(coursesRes.courses || []);
      }
      if (statsRes.success) {
        const currentMonthRev = statsRes.stats?.revenueByMonth?.[11]?.revenue || 0;
        setTotalRevenue(currentMonthRev);
      }
    } catch (e) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa khóa học "${title}"?`)) return;
    try {
      const res = await deleteAdminCourseV2(id);
      if (res.success) {
        toast.success("Đã xóa khóa học");
        loadData();
      } else {
        toast.error(res.message || "Không thể xóa khóa học");
      }
    } catch (e) {
      toast.error("Lỗi kết nối máy chủ");
    }
  };

  // Tính toán số liệu thống kê
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.isPublished).length;
  const draftCourses = totalCourses - publishedCourses; 

  // Lọc dữ liệu local
  const filteredCourses = courses.filter(c => {
    // Lọc theo search (title hoặc ID)
    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = c.title?.toLowerCase().includes(q);
      const idMatch = (c.id || c._id)?.toLowerCase().includes(q);
      if (!titleMatch && !idMatch) return false;
    }
    // Lọc theo danh mục
    if (categoryFilter) {
      const catName = c.categoryRef?.name || c.categoryId || "Khác";
      if (catName !== categoryFilter) return false;
    }
    // Lọc theo trạng thái
    if (statusFilter) {
      if (statusFilter === "published" && !c.isPublished) return false;
      if (statusFilter === "draft" && c.isPublished) return false;
    }
    return true;
  });

  // Lấy danh sách danh mục duy nhất từ dữ liệu khóa học để làm bộ lọc
  const uniqueCategories = [...new Set(courses.map(c => c.categoryRef?.name || c.categoryId || "Khác"))];

  const getCategoryColor = (catName) => {
    if (!catName) return "badge-blue";
    if (catName.toLowerCase().includes("toeic")) return "badge-blue";
    if (catName.toLowerCase().includes("tập sự")) return "badge-orange";
    return "badge-purple";
  };

  // Sparkline SVGs (static for visual)
  const SparklineGreen = () => (
    <svg width="140" height="40" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 35 L20 28 L40 34 L60 18 L80 24 L100 8 L140 18" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  
  const SparklineTeal = () => (
    <svg width="140" height="40" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 38 L30 30 L50 34 L80 15 L100 20 L140 6" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const SparklineOrange = () => (
    <svg width="140" height="40" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 24 L20 30 L50 18 L80 32 L100 15 L140 24" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const SparklinePurple = () => (
    <svg width="140" height="40" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 36 L24 22 L48 30 L72 12 L96 20 L140 6" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="tz-admin-courses">
      <header className="tz-courses-header">
        <div className="tz-courses-header-left">
          <h2>Quản lý khóa học</h2>
          <p>Quản lý và theo dõi tất cả khóa học trong hệ thống</p>
        </div>
        <button className="tz-btn-add-course" onClick={() => navigate("/admin/courses/create")}>
          + Thêm khóa học
        </button>
      </header>

      {/* Stats Cards */}
      <div className="tz-courses-stats">
        <div className="tz-course-stat-card">
          <div className="tz-course-stat-icon tz-bg-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm2 4h12v2H6zm-2 4h16v2H4zm2 4h12v2H6z"></path></svg>
          </div>
          <div className="tz-course-stat-info">
            <h3>{totalCourses}</h3>
            <p className="tz-stat-title">Tổng khóa học</p>
            <p className="tz-stat-subtitle">Tất cả khóa học</p>
          </div>
          <div className="tz-course-stat-chart">
            <SparklineGreen />
          </div>
        </div>

        <div className="tz-course-stat-card">
          <div className="tz-course-stat-icon tz-bg-teal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
          </div>
          <div className="tz-course-stat-info">
            <h3>{publishedCourses}</h3>
            <p className="tz-stat-title">Đã xuất bản</p>
            <p className="tz-stat-subtitle">{totalCourses ? Math.round((publishedCourses/totalCourses)*100) : 0}% tổng số</p>
          </div>
          <div className="tz-course-stat-chart">
            <SparklineTeal />
          </div>
        </div>

        <div className="tz-course-stat-card">
          <div className="tz-course-stat-icon tz-bg-orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
          </div>
          <div className="tz-course-stat-info">
            <h3>{draftCourses}</h3>
            <p className="tz-stat-title">Bản nháp</p>
            <p className="tz-stat-subtitle">{totalCourses ? Math.round((draftCourses/totalCourses)*100) : 0}% tổng số</p>
          </div>
          <div className="tz-course-stat-chart">
            <SparklineOrange />
          </div>
        </div>

        <div className="tz-course-stat-card">
          <div className="tz-course-stat-icon tz-bg-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"></path></svg>
          </div>
          <div className="tz-course-stat-info">
            <h3>{totalRevenue.toLocaleString()}đ</h3>
            <p className="tz-stat-title">Doanh thu</p>
            <p className="tz-stat-subtitle">Tháng này</p>
          </div>
          <div className="tz-course-stat-chart">
            <SparklinePurple />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="tz-courses-filter-bar">
        <div className="tz-filter-left">
          <div className="tz-search-pill">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Tìm kiếm khóa học..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          
          <div className="tz-select-pill">
            <span>Danh mục:</span>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="">Tất cả</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="tz-select-pill">
            <span>Trạng thái:</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>
        
        <div className="tz-filter-right">
          <button className="tz-btn-refresh" onClick={loadData}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            Làm mới
          </button>
          <button className="tz-btn-icon-square">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="tz-courses-table-container">
        <table className="tz-courses-table">
          <thead>
            <tr>
              <th>Khóa học <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th>Mã (ID) <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th>Danh mục <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th>Giảng viên <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th>Trạng thái <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th>Cập nhật <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4">Đang tải dữ liệu...</td></tr>
            ) : filteredCourses.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4">Không tìm thấy khóa học nào phù hợp</td></tr>
            ) : (
              filteredCourses.map(course => {
                const catName = course.categoryRef?.name || course.categoryId || "Khác";
                return (
                  <tr key={course._id}>
                    <td>
                      <div className="tz-course-cell">
                        {course.thumbnail ? (
                          <img src={`${apiPath(course.thumbnail)}`} alt={course.title} className="tz-course-thumb" />
                        ) : (
                          <div className={`tz-course-thumb-placeholder ${getCategoryColor(catName)}`}>
                            {course.title.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="tz-course-info">
                          <strong>{course.title}</strong>
                          <span>{course.price ? (course.price.toString().includes('đ') ? course.price : `${course.price.toLocaleString()}đ`) : 'Khóa học miễn phí'}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="tz-course-id">{course.id || course._id.substring(0, 8)}</span></td>
                    <td>
                      <span className={`tz-cat-badge ${getCategoryColor(catName)}`}>
                        {catName}
                      </span>
                    </td>
                    <td><span className="tz-course-instructor">{course.instructor || "Chưa cập nhật"}</span></td>
                    <td>
                      <span className={`tz-status-pill ${course.isPublished ? 'published' : 'draft'}`}>
                        {course.isPublished ? "Đã xuất bản" : "Bản nháp"}
                      </span>
                    </td>
                    <td>
                      <div className="tz-date-cell">
                        <span>{new Date(course.updatedAt || course.createdAt).toLocaleDateString("vi-VN")}</span>
                        <small>{new Date(course.updatedAt || course.createdAt).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}</small>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="tz-course-actions">
                        <button 
                          className="tz-btn-icon-circle tz-bg-gray" 
                          title="Xem chi tiết"
                          onClick={() => window.open(`/courses/${course.id || course._id}`, '_blank')}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button className="tz-btn-icon-circle tz-bg-blue" title="Sửa" onClick={() => navigate(`/admin/courses/edit/${course._id}`)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className="tz-btn-icon-circle tz-bg-red" title="Xóa" onClick={() => handleDelete(course._id, course.title)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {!loading && courses.length > 0 && (
          <div className="tz-courses-footer">
            <div className="tz-showing-text">
              Hiển thị 1 - {filteredCourses.length} trong {filteredCourses.length} khóa học
            </div>
            <div className="tz-pagination-controls">
              <div className="tz-pagination">
                <button className="tz-page-btn tz-page-arrow" disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button className="tz-page-btn tz-page-active">1</button>
                <button className="tz-page-btn tz-page-arrow" disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
              <div className="tz-items-per-page">
                <select disabled>
                  <option>10 / trang</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
