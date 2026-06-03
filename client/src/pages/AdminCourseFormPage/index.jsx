import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import JoditEditor from "jodit-react";
import { fetchAdminCoursesV2, createAdminCourseV2, updateAdminCourseV2 } from "../../api/adminCoursesApi";
import { fetchCategories } from "../../api/categories";
import { fetchPublicInstructors } from "../../api/instructors";
import { getAuth } from "../../auth/auth";
import { dateToDatetimeLocalVN } from "../../utils/datetime";
import { COL_LABELS } from "../../utils/courseSchedule";
import "./AdminCourseForm.css";
import { apiPath } from "../../api/base";

/**
 * Số buổi học cố định theo danh mục, khớp với lộ trình mẫu phía server
 * (server/src/data/*Curriculum.js). Khi chọn danh mục có lộ trình, "Số buổi"
 * sẽ tự điền và không cho sửa tay để đồng bộ với số bài học được tạo sẵn.
 */
const SESSIONS_BY_SLUG = {
  "tap-su": 12,
  "toeic-a": 27,
  "toeic-sw": 28
};

export default function AdminCourseFormPage() {
  const auth = getAuth();
  const navigate = useNavigate();
  const { id: routeId } = useParams(); // Nếu có id thì là edit mode

  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const fileInputRef = useRef(null);

  const defaultFormData = {
    id: "",
    categoryId: "tap-su",
    categoryRef: "",
    title: "",
    description: "",
    schedule: "",
    totalSessions: 0,
    sessionDuration: 90,
    enrollmentOpenDate: "",
    enrollmentCloseDate: "",
    isPublished: false,
    trialLessonCount: 2,
    enrolled: "0",
    capacity: "30",
    rating: 5,
    price: "",
    instructor: "",
    instructorRef: "",
    sessionCols: [],
    startTime: "18:00",
    endTime: "19:30",
    thumbnail: null
  };

  const [formData, setFormData] = useState({ ...defaultFormData });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  if (!auth || (auth.role !== "admin" && auth.role !== "operation")) {
    return <Navigate to="/" replace />;
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, catsRes, instRes] = await Promise.all([
        routeId ? fetchAdminCoursesV2() : Promise.resolve({ success: true, courses: [] }),
        fetchCategories(),
        fetchPublicInstructors()
      ]);

      let cats = [];
      if (catsRes.success) {
        cats = catsRes.categories || [];
        setCategories(cats);
      }
      if (instRes.success) {
        setInstructors(instRes.instructors || []);
      }

      if (routeId) {
        // Edit mode
        if (coursesRes.success) {
          const course = (coursesRes.courses || []).find(c => c._id === routeId);
          if (course) {
            setEditingId(course._id);
            
            // Parse sessions
            const cols = course.sessions ? [...new Set(course.sessions.map(s => s.col))] : [];
            let stTime = "18:00";
            let enTime = "19:30";
            if (course.sessions && course.sessions.length > 0) {
              const sMin = course.sessions[0].startMin;
              const eMin = course.sessions[0].endMin;
              stTime = `${String(Math.floor(sMin/60)).padStart(2,'0')}:${String(sMin%60).padStart(2,'0')}`;
              enTime = `${String(Math.floor(eMin/60)).padStart(2,'0')}:${String(eMin%60).padStart(2,'0')}`;
            }

            setFormData({
              id: course.id,
              categoryId: course.categoryId,
              categoryRef: course.categoryRef?._id || course.categoryRef || "",
              title: course.title,
              description: course.description || "",
              schedule: course.schedule || "",
              totalSessions: course.totalSessions || 0,
              sessionDuration: course.sessionDuration || 90,
              enrollmentOpenDate: course.enrollmentOpenDate ? dateToDatetimeLocalVN(course.enrollmentOpenDate) : "",
              enrollmentCloseDate: course.enrollmentCloseDate ? dateToDatetimeLocalVN(course.enrollmentCloseDate) : "",
              isPublished: course.isPublished || false,
              trialLessonCount: course.trialLessonCount || 2,
              enrolled: course.enrolled || "0",
              capacity: course.capacity || "30",
              rating: course.rating || 5,
              price: course.price || "",
              instructor: course.instructor || "",
              instructorRef: course.instructorRef?._id || course.instructorRef || "",
              sessionCols: cols,
              startTime: stTime,
              endTime: enTime,
              thumbnail: null
            });
            setThumbnailPreview(course.thumbnail ? `${apiPath(course.thumbnail)}` : null);
          } else {
            toast.error("Không tìm thấy khóa học");
            navigate("/admin/courses");
          }
        }
      } else {
        // Create mode
        setEditingId(null);
        setFormData({ ...defaultFormData, categoryRef: cats[0]?.id || "" });
        setThumbnailPreview(null);
      }
    } catch (e) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [routeId]);

  // Tự điền "Số buổi" theo danh mục được chọn (nếu danh mục có lộ trình cố định).
  useEffect(() => {
    const cat = categories.find((c) => c.id === formData.categoryRef);
    const auto = cat ? SESSIONS_BY_SLUG[cat.slug] : undefined;
    if (auto != null && Number(formData.totalSessions) !== auto) {
      setFormData((prev) => ({ ...prev, totalSessions: auto }));
    }
  }, [formData.categoryRef, categories]);

  const selectedCategory = categories.find((c) => c.id === formData.categoryRef);
  const autoSessions = selectedCategory ? SESSIONS_BY_SLUG[selectedCategory.slug] : undefined;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      const file = files[0];
      if (file) {
        setFormData(prev => ({ ...prev, thumbnail: file }));
        setThumbnailPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleDescriptionChange = (content) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const toggleSessionCol = (col) => {
    setFormData(prev => {
      const cols = prev.sessionCols.includes(col) 
        ? prev.sessionCols.filter(c => c !== col)
        : [...prev.sessionCols, col];
      return { ...prev, sessionCols: cols };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Tên khóa học là bắt buộc");
      return;
    }

    // Build sessions array
    const sessions = [];
    if (formData.sessionCols.length > 0) {
      const [h1, m1] = formData.startTime.split(":").map(Number);
      const [h2, m2] = formData.endTime.split(":").map(Number);
      const startMin = h1 * 60 + m1;
      const endMin = h2 * 60 + m2;
      
      formData.sessionCols.forEach(col => {
        sessions.push({ col, startMin, endMin });
      });
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === "thumbnail" && formData[key]) {
        data.append("thumbnail", formData[key]);
      } else if (key === "sessionCols" || key === "startTime" || key === "endTime") {
        // skip
      } else {
        data.append(key, formData[key] === null ? "" : formData[key]);
      }
    });
    
    if (sessions.length > 0) {
      data.append("sessions", JSON.stringify(sessions));
    }

    try {
      let res;
      if (editingId) {
        res = await updateAdminCourseV2(editingId, data);
      } else {
        res = await createAdminCourseV2(data);
      }

      if (res.success) {
        toast.success(res.message);
        navigate("/admin/courses");
      } else {
        toast.error(res.message || "Lỗi lưu khóa học");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem" }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="tz-course-form-page">
      <div className="tz-course-form-header-row">
        <button className="tz-btn-back" onClick={() => navigate("/admin/courses")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Quay lại
        </button>
        <div className="tz-header-titles">
          <h1>{editingId ? "Sửa khóa học" : "Thêm khóa học mới"}</h1>
          <p>Tạo và thiết lập thông tin cho khóa học của bạn</p>
        </div>
      </div>

      <div className="tz-form-stepper">
        <div className="tz-step active">
          <div className="tz-step-number">1</div>
          <div className="tz-step-text">Thông tin cơ bản</div>
        </div>
        <div className="tz-step-divider"></div>
        <div className="tz-step">
          <div className="tz-step-number">2</div>
          <div className="tz-step-text">Nội dung & Hình ảnh</div>
        </div>
        <div className="tz-step-divider"></div>
        <div className="tz-step">
          <div className="tz-step-number">3</div>
          <div className="tz-step-text">Lịch học & Thời gian</div>
        </div>
        <div className="tz-step-divider"></div>
        <div className="tz-step">
          <div className="tz-step-number">4</div>
          <div className="tz-step-text">Cài đặt nâng cao</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="tz-form-layout-grid">
        <div className="tz-form-main-col">
          {/* 1. Thông tin cơ bản */}
          <div className="tz-form-card-box">
            <div className="tz-card-header">
              <div className="tz-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg></div>
              <h3>Thông tin cơ bản</h3>
            </div>
            <div className="tz-card-body">
              <div className="tz-form-group">
                <label>Tên khóa học <span className="text-danger">*</span></label>
                <div className="tz-input-with-counter">
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Nhập tên khóa học..." />
                  <span className="char-counter">{formData.title.length}/100</span>
                </div>
              </div>
              
              <div className="tz-form-row">
                <div className="tz-form-group">
                  <label>Mã (ID)</label>
                  <input type="text" name="id" value={formData.id} onChange={handleChange} placeholder="Để trống tự tạo" disabled={!!editingId} />
                </div>
                <div className="tz-form-group">
                  <label>Danh mục <span className="text-danger">*</span></label>
                  <select name="categoryRef" value={formData.categoryRef} onChange={handleChange}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="tz-form-row">
                <div className="tz-form-group">
                  <label>Giảng viên <span className="text-danger">*</span></label>
                  <select name="instructorRef" value={formData.instructorRef} onChange={(e) => {
                    const selInstructor = instructors.find(i => i.id === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      instructorRef: e.target.value,
                      instructor: selInstructor ? selInstructor.display : ""
                    }));
                  }}>
                    <option value="">Chọn giảng viên</option>
                    {instructors.map((i, idx) => <option key={i.id || `inst-${idx}`} value={i.id}>{i.display}</option>)}
                  </select>
                </div>
                <div className="tz-form-group">
                  <label>Học phí <span className="text-danger">*</span></label>
                  <div className="tz-input-with-suffix">
                    <input type="text" name="price" value={formData.price} onChange={handleChange} placeholder="VD: 3.200.000" />
                    <span className="suffix">VNĐ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Nội dung & Hình ảnh */}
          <div className="tz-form-card-box">
            <div className="tz-card-header">
              <div className="tz-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>
              <h3>Nội dung & Hình ảnh</h3>
            </div>
            <div className="tz-card-body tz-grid-2col-asym">
              <div className="tz-form-group">
                <label>Thumbnail <span className="text-danger">*</span></label>
                <div className="tz-upload-zone" onClick={() => fileInputRef.current.click()}>
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Preview" className="tz-preview-img" />
                  ) : (
                    <div className="tz-upload-placeholder">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      <p>Kéo & thả ảnh vào đây<br/>hoặc bấm để chọn file</p>
                      <small>PNG, JPG, JPEG (tối đa 5MB)</small>
                    </div>
                  )}
                  <input type="file" name="thumbnail" accept="image/*" onChange={handleChange} ref={fileInputRef} style={{ display: 'none' }} />
                </div>
              </div>

              <div className="tz-form-group">
                <label>Mô tả chi tiết <span className="text-danger">*</span></label>
                <div className="tz-quill-wrapper">
                  <JoditEditor
                    value={formData.description}
                    config={{
                      readonly: false,
                      height: 250,
                      placeholder: "Nhập mô tả khóa học chi tiết...",
                      style: { fontFamily: 'inherit', fontSize: '0.95rem' },
                      toolbarAdaptive: false,
                      buttons: "bold,italic,underline,strikethrough,ul,ol,font,fontsize,paragraph,lineHeight,superscript,subscript,image,video,link,align,undo,redo,hr,eraser,copyformat,fullsize"
                    }}
                    onBlur={newContent => handleDescriptionChange(newContent)}
                    onChange={() => {}}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Lịch học & Thời gian */}
          <div className="tz-form-card-box">
            <div className="tz-card-header">
              <div className="tz-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div>
              <h3>Lịch học & Thời gian</h3>
            </div>
            <div className="tz-card-body">
              <div className="tz-form-group">
                <label>Số buổi <span className="text-danger">*</span></label>
                <input
                  type="number"
                  name="totalSessions"
                  value={formData.totalSessions}
                  onChange={handleChange}
                  readOnly={autoSessions != null}
                />
                {autoSessions != null && (
                  <small className="tz-field-hint">
                    Số buổi được tự động lấy theo lộ trình của danh mục "{selectedCategory?.name}".
                  </small>
                )}
              </div>

              <div className="tz-form-group">
                <label>Mô tả lịch học ngắn</label>
                <input type="text" name="schedule" value={formData.schedule} onChange={handleChange} placeholder="VD: Tối 2-4-6 | 18h - 19h30" />
              </div>

              <div className="tz-form-group">
                <label>Các thứ có buổi học <span className="text-danger">*</span></label>
                <div className="tz-day-chips">
                  {COL_LABELS.map((label, col) => {
                    const isChecked = formData.sessionCols.includes(col);
                    return (
                      <label key={label} className={`tz-day-chip ${isChecked ? 'active' : ''}`}>
                        <div className="tz-checkbox-custom">
                          <input type="checkbox" checked={isChecked} onChange={() => toggleSessionCol(col)} />
                          {isChecked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                        {label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="tz-form-row">
                <div className="tz-form-group">
                  <label>Giờ bắt đầu *</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} />
                </div>
                <div className="tz-form-group">
                  <label>Giờ kết thúc *</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Cài đặt nâng cao */}
          <div className="tz-form-card-box tz-form-card-advanced">
            <div className="tz-card-header">
              <div className="tz-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></div>
              <h3>Cài đặt nâng cao</h3>
            </div>
            <div className="tz-card-body">
              <div className="tz-form-row">
                <div className="tz-form-group">
                  <label>Mở đăng ký (Ngày giờ)</label>
                  <input type="datetime-local" name="enrollmentOpenDate" value={formData.enrollmentOpenDate} onChange={handleChange} />
                </div>
                <div className="tz-form-group">
                  <label>Đóng đăng ký (Ngày giờ)</label>
                  <input type="datetime-local" name="enrollmentCloseDate" value={formData.enrollmentCloseDate} onChange={handleChange} />
                </div>
              </div>

              <div className="tz-form-row" style={{ marginTop: '1rem' }}>
                <div className="tz-form-group checkbox-group">
                  <label className="tz-custom-checkbox-row">
                    <div className="tz-checkbox-custom active">
                      <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} />
                      {formData.isPublished && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <span>Xuất bản khóa học (Hiển thị công khai)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="tz-form-sidebar-col">
          {/* Widget 1: Xem trước khóa học */}
          <div className="tz-sidebar-widget">
            <h4 className="tz-widget-title">Xem trước khóa học</h4>
            <div className="tz-preview-card">
              <div className="tz-preview-cover">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Preview" />
                ) : (
                  <div className="tz-preview-cover-placeholder">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  </div>
                )}
                <span className="tz-preview-badge">Nháp</span>
              </div>
              <div className="tz-preview-content">
                <h5 className="tz-preview-title">{formData.title || "Tên khóa học"}</h5>
                <p className="tz-preview-id">{formData.id || "Mã khóa học"}</p>
                
                <ul className="tz-preview-list">
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Giảng viên: {formData.instructor || "--"}
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                    Danh mục: {categories.find(c => c.id === formData.categoryRef)?.name || "--"}
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Học phí: {formData.price || "--"}
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Số buổi: {formData.totalSessions || "--"}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Widget 2: Tình trạng */}
          <div className="tz-sidebar-widget tz-widget-status">
            <h4 className="tz-widget-title">Tình trạng</h4>
            <div className="tz-status-badge-container">
               <span className={`tz-status-pill ${formData.isPublished ? 'published' : 'draft'}`}>
                 {formData.isPublished ? "Đã xuất bản" : "Nháp"}
               </span>
            </div>
            <p className="tz-status-desc">
              {formData.isPublished 
                ? "Khóa học đã được xuất bản và đang hiển thị công khai trên hệ thống."
                : "Khóa học chưa được xuất bản. Bạn có thể chỉnh sửa và xuất bản bất kỳ lúc nào."}
            </p>
          </div>

          {/* Widget 3: Mẹo */}
          <div className="tz-sidebar-widget tz-widget-tips">
            <h4 className="tz-widget-title">Mẹo</h4>
            <ul className="tz-tips-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Điền đầy đủ thông tin để học viên hiểu rõ hơn về khóa học.
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Ảnh bìa đẹp giúp tăng tỉ lệ đăng ký.
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Lịch học rõ ràng giúp học viên dễ lựa chọn.
              </li>
            </ul>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="tz-form-sticky-footer">
          <div className="tz-footer-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <div className="tz-footer-text">
              <strong>Tự động lưu bản nháp</strong>
              <span>Dữ liệu sẽ được lưu tự động</span>
            </div>
          </div>
          <div className="tz-footer-actions">
            <button type="button" className="tz-btn-cancel" onClick={() => navigate("/admin/courses")}>Hủy bỏ</button>
            <button type="submit" className="tz-btn-save">Lưu & Tiếp tục <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
          </div>
        </div>
      </form>
    </div>
  );
}
