import { useEffect, useState } from "react";
import { fetchTeacherCourses, fetchTeacherCourseStudents } from "../../api/teacherApi";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuth } from "../../auth/auth";
import { apiPath } from "../../api/base";
import "./TeacherCourses.css";

// --- SVG Icons ---
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconBook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
  </svg>
);
const IconHeadphones = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
);
const IconPencil = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
);
const IconMic = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
);
const IconBookLarge = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
);
const IconStarLarge = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
const IconGraduation = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
);
const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);
const IconMonitor = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
);
const IconCheckCircle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);
const IconList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);
const IconFilter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);

const IconX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconUserCircle = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"></circle><path d="M3,21 h18 C 21,12 3,12 3,21"></path></svg>
);


export default function TeacherCoursesPage() {
  const auth = getAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalLessons: 0, avgCompletionRate: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [filterMode, setFilterMode] = useState("all");
  const [showFilterDrop, setShowFilterDrop] = useState(false);

  if (!auth || (auth.role !== "teacher" && auth.role !== "admin")) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await fetchTeacherCourses();
      if (res.success) {
        setCourses(res.courses);
        if (res.stats) setStats(res.stats);
      } else {
        toast.error("Lỗi lấy danh sách khóa học");
      }
    } catch (e) {
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudents = async (course) => {
    setSelectedCourse(course);
    setShowModal(true);
    setStudents([]);
    try {
      setLoadingStudents(true);
      const res = await fetchTeacherCourseStudents(course._id);
      if (res.success) {
        setStudents(res.students);
      }
    } catch (e) {
      toast.error("Lỗi lấy danh sách học viên");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Helper for Premium UI Cover
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
    if (name.includes("SPEAKING") || name.includes("SW")) return "tz-cover-darkblue";
    return "tz-cover-blue";
  };

  const getCoverGraphic = (catName, courseId) => {
    const name = catName?.toUpperCase() || "";
    const id = courseId?.toUpperCase() || "";
    if (name.includes("TOEIC B")) return <IconHeadphones />;
    if (name.includes("TOEIC A")) return <IconPencil />;
    if (name.includes("SW") || name.includes("SPEAKING")) return <IconMic />;
    if (id.includes("35")) return <IconGraduation />;
    if (id.includes("09")) return <IconStarLarge />;
    return <IconBookLarge />;
  };

  const getFilteredCourses = () => {
    if (filterMode === "all") return courses;
    return courses.filter(c => {
      const cat = c.categoryRef?.name?.toUpperCase() || "";
      if (filterMode === "tapsu") return cat.includes("TẬP SỰ");
      if (filterMode === "toeica") return cat.includes("TOEIC A");
      if (filterMode === "toeicb") return cat.includes("TOEIC B");
      return true;
    });
  };

  const filteredCourses = getFilteredCourses();

  if (loading) {
    return (
      <div className="tz-tc-loading">
        <div className="tz-spinner"></div>
        <p>Đang tải dữ liệu giảng viên...</p>
      </div>
    );
  }

  return (
    <div className="tz-tc-page">
      <div className="tz-tc-wrapper">
        <Link to="#" className="tz-tc-back-link"><IconArrowLeft /> Quản lý Lớp học</Link>
        {/* Hero Banner */}
        <div className="tz-tc-banner">
          <div className="tz-tc-banner-content">
            <h1>Workspace Giáo viên</h1>
            <p>Chào mừng bạn trở lại! Bạn đang phụ trách <strong className="tz-tc-text-green">{courses.length}</strong> lớp học.</p>
          </div>
          <div className="tz-tc-banner-right">
             <svg width="400" height="140" viewBox="0 0 400 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 140C50 140 100 20 200 20C300 20 400 140 400 140H50Z" fill="#f0fdf4"/>
                {/* Simulated dashboard/charts illustration */}
                <rect x="220" y="30" width="120" height="80" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="2"/>
                <circle cx="250" cy="70" r="16" fill="#e6f6ee" />
                <path d="M250 54 A16 16 0 0 1 266 70 L250 70 Z" fill="#10b981" />
                <rect x="280" y="50" width="40" height="4" rx="2" fill="#cbd5e1"/>
                <rect x="280" y="60" width="30" height="4" rx="2" fill="#94a3b8"/>
                <rect x="280" y="70" width="50" height="4" rx="2" fill="#e2e8f0"/>
                
                <rect x="226" y="36" width="4" height="4" rx="1" fill="#ef4444"/>
                <rect x="234" y="36" width="4" height="4" rx="1" fill="#f59e0b"/>
                <rect x="242" y="36" width="4" height="4" rx="1" fill="#10b981"/>

                <rect x="290" y="110" width="80" height="12" rx="2" fill="#cbd5e1"/>
                <rect x="280" y="122" width="100" height="18" rx="2" fill="#64748b"/>
                <path d="M200 140V80C200 70 210 65 220 70C225 75 230 80 235 95C240 110 240 140 240 140Z" fill="#10b981"/>
                <path d="M200 140V80C200 70 190 65 180 70C175 75 170 80 165 95C160 110 160 140 160 140Z" fill="#34d399"/>
                <rect x="195" y="100" width="10" height="40" fill="#059669"/>
             </svg>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="tz-tc-stats-bar">
          <div className="tz-tc-stat-card">
            <div className="tz-tc-stat-icon green">
              <IconBook />
            </div>
            <div className="tz-tc-stat-info">
              <h3>{courses.length}</h3>
              <p>Tổng lớp học</p>
            </div>
            <div className="tz-tc-stat-sparkline"><svg viewBox="0 0 50 20"><polyline points="0,15 10,10 20,18 30,5 40,12 50,2" fill="none" stroke="#10b981" strokeWidth="2"/></svg></div>
          </div>
          <div className="tz-tc-stat-card">
            <div className="tz-tc-stat-icon blue">
              <IconUsers />
            </div>
            <div className="tz-tc-stat-info">
              <h3>{stats.totalStudents}</h3>
              <p>Tổng học viên</p>
            </div>
            <div className="tz-tc-stat-sparkline"><svg viewBox="0 0 50 20"><polyline points="0,18 10,12 20,15 30,8 40,10 50,4" fill="none" stroke="#3b82f6" strokeWidth="2"/></svg></div>
          </div>
          <div className="tz-tc-stat-card">
            <div className="tz-tc-stat-icon purple">
              <IconMonitor />
            </div>
            <div className="tz-tc-stat-info">
              <h3>{stats.totalLessons}</h3>
              <p>Bài học</p>
            </div>
            <div className="tz-tc-stat-sparkline"><svg viewBox="0 0 50 20"><polyline points="0,10 10,18 20,5 30,12 40,8 50,15" fill="none" stroke="#8b5cf6" strokeWidth="2"/></svg></div>
          </div>
          <div className="tz-tc-stat-card">
            <div className="tz-tc-stat-icon orange">
              <IconCheckCircle />
            </div>
            <div className="tz-tc-stat-info">
              <h3>{stats.avgCompletionRate}%</h3>
              <p>Tỷ lệ hoàn thành</p>
            </div>
            <div className="tz-tc-stat-sparkline"><svg viewBox="0 0 50 20"><polyline points="0,20 10,18 20,10 30,12 40,5 50,8" fill="none" stroke="#f59e0b" strokeWidth="2"/></svg></div>
          </div>
        </div>

        {/* List Header */}
        <div className="tz-tc-list-header">
          <h2>Danh sách lớp học</h2>
          <div className="tz-tc-list-controls">
            <div style={{position: "relative"}}>
              <button className="tz-tc-filter-btn" onClick={() => setShowFilterDrop(!showFilterDrop)}>
                <IconFilter /> 
                {filterMode === 'all' ? 'Tất cả trạng thái' : filterMode === 'tapsu' ? 'Tập Sự' : filterMode === 'toeica' ? 'TOEIC A' : 'TOEIC B'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              {showFilterDrop && (
                <div className="tz-tc-filter-menu">
                  <button onClick={() => {setFilterMode('all'); setShowFilterDrop(false);}}>Tất cả trạng thái</button>
                  <button onClick={() => {setFilterMode('tapsu'); setShowFilterDrop(false);}}>Khóa Tập Sự</button>
                  <button onClick={() => {setFilterMode('toeica'); setShowFilterDrop(false);}}>Khóa TOEIC A</button>
                  <button onClick={() => {setFilterMode('toeicb'); setShowFilterDrop(false);}}>Khóa TOEIC B</button>
                </div>
              )}
            </div>
            <div className="tz-tc-divider"></div>
            <div className="tz-tc-view-toggle">
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><IconGrid /></button>
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><IconList /></button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {filteredCourses.length === 0 ? (
          <div className="tz-tc-empty">
            <div className="tz-tc-empty-icon"><IconBook /></div>
            <h2>Không có lớp học nào</h2>
            <p>Không tìm thấy lớp học phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "tz-tc-grid" : "tz-tc-list"}>
            {filteredCourses.map((course) => {
              const catName = course.categoryRef?.name || course.categoryId;
              const colorClass = getCoverColorClass(catName);
              const coverText = getCoverInitials(catName, course.title);

              return (
                <div key={course._id} className="tz-tc-card">
                  {/* Cover */}
                  {course.thumbnail ? (
                    <div className="tz-tc-cover" style={{ padding: 0, background: '#f1f5f9' }}>
                      <img src={apiPath(course.thumbnail)} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span className="tz-tc-badge-light" style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.9)', color: '#0f172a', margin: 0 }}>MÃ LỚP: {course.id}</span>
                    </div>
                  ) : (
                    <div className={`tz-tc-cover ${colorClass}`}>
                      <span className="tz-tc-badge-light">MÃ LỚP: {course.id}</span>
                      <div className="tz-tc-cover-content">
                        <div className="tz-tc-cover-text">{coverText}</div>
                        <div className="tz-tc-cover-graphic">
                          {getCoverGraphic(catName, course.id)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Body */}
                  <div className="tz-tc-body">
                    <div className="tz-tc-info-wrapper">
                      <span className="tz-tc-category-tag">{catName || "Khóa học"}</span>
                      <h3 className="tz-tc-title">{course.title}</h3>
                    </div>
                    
                    <div className="tz-tc-actions">
                      <button className="tz-tc-btn-outline" onClick={() => handleViewStudents(course)}>
                        <IconUsers /> Xem học viên
                      </button>
                      <Link to={`/teacher/courses/${course._id}/lessons`} className="tz-tc-btn-primary">
                        <IconBook /> Soạn giáo trình
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Students */}
        {showModal && (
          <div className="tz-tc-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="tz-tc-modal" onClick={e => e.stopPropagation()}>
              <div className="tz-tc-modal-header">
                <h2><IconUsers /> Danh sách Học viên</h2>
                <button onClick={() => setShowModal(false)} className="tz-tc-modal-close">
                  <IconX />
                </button>
              </div>
              
              <div className="tz-tc-modal-body">
                <div className="tz-tc-modal-info">
                  <strong>Khóa học:</strong> {selectedCourse?.title}
                </div>
                
                {loadingStudents ? (
                  <div className="tz-tc-loading-small">
                    <div className="tz-spinner"></div>
                    <p>Đang tải danh sách...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="tz-tc-empty-small">
                    <p>Chưa có học viên nào tham gia khóa học này.</p>
                  </div>
                ) : (
                  <div className="tz-tc-table-wrapper">
                    <table className="tz-tc-table">
                      <thead>
                        <tr>
                          <th>Học viên</th>
                          <th>Liên hệ</th>
                          <th>Ngày tham gia</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(enr => (
                          <tr key={enr._id}>
                            <td>
                              <div className="tz-tc-user-cell">
                                <div className="tz-tc-avatar">
                                  {(enr.user?.name || "U").charAt(0).toUpperCase()}
                                </div>
                                <span className="tz-tc-user-name">{enr.user?.name || "Học viên ẩn danh"}</span>
                              </div>
                            </td>
                            <td><span className="tz-tc-email">{enr.user?.email || "—"}</span></td>
                            <td>{new Date(enr.enrolledAt).toLocaleDateString("vi-VN")}</td>
                            <td>
                              {enr.isTrial 
                                ? <span className="tz-tc-status trial">Học thử</span> 
                                : <span className="tz-tc-status paid">Chính thức</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
