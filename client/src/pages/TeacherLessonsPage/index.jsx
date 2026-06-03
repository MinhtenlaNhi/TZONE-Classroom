import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetchJson, apiPath } from "../../api/base";
import { createTeacherSection, updateTeacherSection, createTeacherLesson, updateTeacherLesson, uploadLessonMaterial, updateLessonMaterial, deleteLessonMaterial, createLessonAssignment, updateLessonAssignment } from "../../api/teacherApi";
import { toast } from "react-toastify";
import "./TeacherLessons.css";

// SVG Icons
const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);
const IconFolder = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);
const IconBookOpen = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
);
const IconBook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const IconFileText = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const IconVideo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);
const IconUploadCloud = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);
const IconTag = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
);
const IconCheckSquare = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
);
const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);
const IconChevronUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
);
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const IconCheckCircleSolid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#10b981" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
);

export default function TeacherLessonsPage() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [expandedLessons, setExpandedLessons] = useState({});
  
  // Modals state
  const [showSecModal, setShowSecModal] = useState(false);
  const [secModalMode, setSecModalMode] = useState("add");
  const [editingSecIdx, setEditingSecIdx] = useState(null);
  const [secTitle, setSecTitle] = useState("");

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonModalMode, setLessonModalMode] = useState("add");
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [activeSecIdx, setActiveSecIdx] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [isFreePreview, setIsFreePreview] = useState(false);

  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [newMaterialTitle, setNewMaterialTitle] = useState("");
  const [newMaterialFile, setNewMaterialFile] = useState(null);
  const [newMaterialKind, setNewMaterialKind] = useState("file");
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editMaterialTitle, setEditMaterialTitle] = useState("");
  const [editMaterialFile, setEditMaterialFile] = useState(null);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [assignmentData, setAssignmentData] = useState({ type: "essay", title: "", description: "", questions: [] });

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const resC = await apiFetchJson(apiPath(`/api/courses/${courseId}`));
      if (resC.success) setCourse(resC.course);
      
      const resL = await apiFetchJson(apiPath(`/api/teacher/courses/${courseId}/lessons`));
      if (resL.success) {
        setLessons(resL.curriculum || []);
      }
    } catch (e) {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const toggleLessonExpand = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  const openAddSectionModal = () => {
    setSecModalMode("add");
    setEditingSecIdx(null);
    setSecTitle("");
    setShowSecModal(true);
  };

  const openEditSectionModal = (sec) => {
    setSecModalMode("edit");
    setEditingSecIdx(sec.sectionIndex);
    setSecTitle(sec.sectionTitle);
    setShowSecModal(true);
  };

  const openAddLessonModal = (sectionIndex) => {
    setLessonModalMode("add");
    setEditingLessonId(null);
    setActiveSecIdx(sectionIndex);
    setLessonTitle("");
    setIsFreePreview(false);
    setShowLessonModal(true);
  };

  const openEditLessonModal = (lesson) => {
    setLessonModalMode("edit");
    setEditingLessonId(lesson._id);
    setActiveSecIdx(lesson.sectionIndex);
    setLessonTitle(lesson.title);
    setIsFreePreview(!!lesson.isFreePreview);
    setShowLessonModal(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    try {
      const res = secModalMode === "edit"
        ? await updateTeacherSection(courseId, editingSecIdx, secTitle)
        : await createTeacherSection(courseId, secTitle);
      if (res.success) {
        toast.success(secModalMode === "edit" ? "Cập nhật chương thành công" : "Thêm chương mới thành công");
        setShowSecModal(false);
        setSecTitle("");
        loadCourseData();
      } else {
        toast.error(res.message || "Lỗi lưu chương");
      }
    } catch { toast.error("Lỗi lưu chương"); }
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      const res = lessonModalMode === "edit"
        ? await updateTeacherLesson(editingLessonId, { title: lessonTitle, isFreePreview })
        : await createTeacherLesson(courseId, activeSecIdx, lessonTitle, isFreePreview);
      if (res.success) {
        toast.success(lessonModalMode === "edit" ? "Cập nhật bài học thành công" : "Thêm bài học mới thành công");
        setShowLessonModal(false);
        setLessonTitle("");
        setIsFreePreview(false);
        loadCourseData();
      } else {
        toast.error(res.message || "Lỗi lưu bài học");
      }
    } catch { toast.error("Lỗi lưu bài học"); }
  };

  const activeLesson = useMemo(() => {
    for (const sec of lessons) {
      const found = sec.lessons?.find((l) => l._id === activeLessonId);
      if (found) return found;
    }
    return null;
  }, [lessons, activeLessonId]);

  const openMaterialsModal = (lesson) => {
    setActiveLessonId(lesson._id);
    setNewMaterialTitle("");
    setNewMaterialFile(null);
    setNewMaterialKind("file");
    setEditingMaterialId(null);
    setEditMaterialTitle("");
    setEditMaterialFile(null);
    setShowMaterialsModal(true);
  };

  const cancelMaterialEdit = () => {
    setEditingMaterialId(null);
    setEditMaterialTitle("");
    setEditMaterialFile(null);
  };

  const startMaterialEdit = (material) => {
    setEditingMaterialId(material._id);
    setEditMaterialTitle(material.title || "");
    setEditMaterialFile(null);
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterialFile) return toast.error("Chọn file tài liệu");
    try {
      const res = await uploadLessonMaterial(activeLessonId, newMaterialFile, newMaterialTitle, newMaterialKind);
      if (res.success) {
        toast.success(newMaterialKind === "video" ? "Tải video buổi học thành công" : "Thêm tài liệu thành công");
        setNewMaterialTitle("");
        setNewMaterialFile(null);
        setNewMaterialKind("file");
        loadCourseData();
      } else {
        toast.error(res.message || "Lỗi upload");
      }
    } catch {
      toast.error("Lỗi upload");
    }
  };

  const handleSaveMaterialEdit = async (e) => {
    e.preventDefault();
    if (!editMaterialTitle.trim()) return toast.error("Nhập tên tài liệu");
    try {
      const res = await updateLessonMaterial(activeLessonId, editingMaterialId, {
        title: editMaterialTitle.trim(),
        file: editMaterialFile || undefined
      });
      if (res.success) {
        toast.success("Cập nhật tài liệu thành công");
        cancelMaterialEdit();
        loadCourseData();
      } else {
        toast.error(res.message || "Lỗi cập nhật");
      }
    } catch {
      toast.error("Lỗi cập nhật");
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Xóa tài liệu này?")) return;
    try {
      const res = await deleteLessonMaterial(activeLessonId, materialId);
      if (res.success) {
        toast.success("Đã xóa tài liệu");
        if (editingMaterialId === materialId) cancelMaterialEdit();
        loadCourseData();
      } else {
        toast.error(res.message || "Lỗi xóa");
      }
    } catch {
      toast.error("Lỗi xóa");
    }
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingAssignmentId) {
        res = await updateLessonAssignment(activeLessonId, editingAssignmentId, assignmentData);
      } else {
        res = await createLessonAssignment(activeLessonId, assignmentData);
      }
      
      if (res.success) {
        toast.success(editingAssignmentId ? "Cập nhật bài tập thành công" : "Tạo bài tập thành công");
        setShowAssignmentModal(false);
        setAssignmentData({ type: "essay", title: "", description: "", questions: [] });
        setEditingAssignmentId(null);
        loadCourseData();
      } else {
        toast.error(res.message || "Lỗi lưu bài tập");
      }
    } catch { toast.error("Lỗi lưu bài tập"); }
  };

  const handleEditAssignment = (lessonId, assignment) => {
    setActiveLessonId(lessonId);
    setEditingAssignmentId(assignment._id);
    setAssignmentData({
      type: assignment.type,
      title: assignment.title,
      description: assignment.essayDescription || "",
      questions: assignment.questions || []
    });
    setShowAssignmentModal(true);
  };
  
  const openCreateAssignmentModal = (lessonId) => {
    setActiveLessonId(lessonId);
    setEditingAssignmentId(null);
    setAssignmentData({ type: "essay", title: "", description: "", questions: [] });
    setShowAssignmentModal(true);
  };

  const handleAddQuestion = () => {
    setAssignmentData({
      ...assignmentData,
      questions: [
        ...assignmentData.questions,
        { questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 }
      ]
    });
  };

  const handleUpdateQuestion = (index, field, value) => {
    const newQs = [...assignmentData.questions];
    newQs[index][field] = value;
    setAssignmentData({ ...assignmentData, questions: newQs });
  };

  const handleRemoveQuestion = (index) => {
    const newQs = [...assignmentData.questions];
    newQs.splice(index, 1);
    setAssignmentData({ ...assignmentData, questions: newQs });
  };

  return (
    <div className="tz-tl-page">
      <div className="tz-tl-container">
        <Link to="/teacher/courses" className="tz-tl-back">
          <IconArrowLeft /> Danh sách khóa học
        </Link>

        <header className="tz-tl-banner">
          <div className="tz-tl-banner-left">
            <div className="tz-tl-header-icon-box">
              <IconBookOpen />
            </div>
            <div className="tz-tl-banner-content">
              <div className="tz-tl-header-meta">QUẢN LÝ GIÁO TRÌNH</div>
              <h1 className="tz-tl-title">{course?.title || "Đang tải..."}</h1>
              <p className="tz-tl-header-desc">Quản lý nội dung, bài học và các hoạt động học tập</p>
            </div>
          </div>
          <div className="tz-tl-banner-right">
             <svg width="300" height="140" viewBox="0 0 300 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 140C20 140 60 40 180 40C300 40 300 140 300 140H20Z" fill="#f0fdf4"/>
                <circle cx="250" cy="50" r="30" fill="#e6f6ee" />
                <path d="M240 60 L240 40 L260 40" stroke="#a7f3d0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="200" y="100" width="80" height="12" rx="2" fill="#cbd5e1"/>
                <rect x="195" y="115" width="90" height="12" rx="2" fill="#94a3b8"/>
                <rect x="190" y="130" width="100" height="10" rx="2" fill="#64748b"/>
                <path d="M150 140V100C150 90 160 75 170 80C175 85 180 90 185 105C190 120 190 140 190 140Z" fill="#10b981"/>
                <path d="M150 140V100C150 90 140 85 130 90C125 95 120 100 115 110C110 125 110 140 110 140Z" fill="#34d399"/>
                <rect x="145" y="120" width="10" height="20" fill="#059669"/>
                <rect x="135" y="130" width="30" height="10" rx="2" fill="#e2e8f0"/>
             </svg>
          </div>
        </header>

        {loading ? (
          <div className="tz-tl-loading">
            <div className="tz-spinner"></div>
            <p>Đang tải cấu trúc giáo trình...</p>
          </div>
        ) : (
          <div className="tz-tl-curriculum">
            {lessons.length === 0 ? (
              <div className="tz-tl-empty">
                <IconFolder />
                <h3>Chưa có giáo trình</h3>
                <p>Khóa học này chưa có chương học nào. Giáo trình sẽ do quản trị viên thiết lập.</p>
              </div>
            ) : (
              lessons.map((sec) => (
                <div key={sec.sectionIndex} className="tz-tl-section">
                  <div className="tz-tl-sec-header">
                    <div className="tz-tl-sec-info">
                      <span className="tz-tl-sec-badge">CHƯƠNG {sec.sectionIndex}</span>
                      <h3 className="tz-tl-sec-title">{sec.sectionTitle}</h3>
                    </div>
                    <div className="tz-tl-sec-actions">
                      <button
                        type="button"
                        className="tz-tl-btn-outline-sm"
                        onClick={() => openEditSectionModal(sec)}
                        title="Sửa chương"
                      >
                        <IconEdit /> 
                      </button>
                    </div>
                  </div>
                  
                  <div className="tz-tl-lessons-list">
                    {sec.lessons.length === 0 ? (
                      <p className="tz-tl-no-lesson">Chưa có bài học nào trong chương này.</p>
                    ) : (
                      sec.lessons.map(lesson => (
                        <div key={lesson._id} className="tz-tl-lesson-group">
                          <div className="tz-tl-lesson-card">
                            <div className="tz-tl-lesson-main">
                              <div className="tz-tl-lesson-drag-handle">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                              </div>
                              <div className="tz-tl-lesson-icon"><IconFileText /></div>
                              <div className="tz-tl-lesson-info">
                                <span className="tz-tl-lesson-name">Bài {lesson.order}: {lesson.title}</span>
                                <div className="tz-tl-lesson-tags">
                                  {lesson.isFreePreview && <span className="tz-tl-tag bg-orange">Học thử</span>}
                                  {lesson.meetUrl && <span className="tz-tl-tag bg-blue"><IconVideo /> Google Meet</span>}
                                  {lesson.materials && lesson.materials.length > 0 && <span className="tz-tl-tag bg-gray">Có tài liệu</span>}
                                </div>
                              </div>
                            </div>
                            <div className="tz-tl-lesson-actions">
                              <button
                                type="button"
                                onClick={() => openEditLessonModal(lesson)}
                                className="tz-tl-action-btn"
                                title="Sửa bài học"
                              >
                                <IconEdit />
                              </button>
                              <Link to={`/teacher/course-links`} className="tz-tl-action-btn" title="Gắn link Meet">
                                <IconVideo />
                              </Link>
                              <button
                                onClick={() => openMaterialsModal(lesson)}
                                className={`tz-tl-action-btn ${lesson.materials?.length ? "has-materials" : ""}`}
                                title={lesson.materials?.length ? "Quản lý tài liệu" : "Tải lên tài liệu"}
                              >
                                <IconUploadCloud />
                              </button>
                              <button onClick={() => openCreateAssignmentModal(lesson._id)} className="tz-tl-action-btn" title="Giao bài tập">
                                <IconTag />
                              </button>
                              {lesson.assignments && lesson.assignments.length > 0 && (
                                <button className="tz-tl-action-btn expander" onClick={() => toggleLessonExpand(lesson._id)}>
                                  {expandedLessons[lesson._id] ? <IconChevronUp /> : <IconChevronDown />}
                                </button>
                              )}
                            </div>
                          </div>
                          {lesson.assignments && lesson.assignments.length > 0 && expandedLessons[lesson._id] && (
                            <div className="tz-tl-lesson-assignments">
                              <div className="tz-tl-lesson-line"></div>
                              <div className="tz-tl-lesson-ass-list">
                                {lesson.assignments.map(ass => (
                                  <div key={ass._id} className="tz-tl-assignment-item">
                                    <div
                                      className="tz-tl-assignment-main"
                                      onClick={() => handleEditAssignment(lesson._id, ass)}
                                    >
                                      <div className="tz-tl-ass-icon"><IconCheckCircleSolid /></div>
                                      <div className="tz-tl-ass-info">
                                        <span className="tz-tl-ass-title">{ass.title}</span>
                                        <span className={`tz-tl-tag ${ass.type === 'quiz' ? 'bg-orange' : 'bg-blue'}`}>
                                          {ass.type === 'quiz' ? 'Trắc nghiệm' : 'Tự luận'}
                                        </span>
                                      </div>
                                      <div className="tz-tl-ass-arrow"><IconChevronRight /></div>
                                    </div>
                                    <Link
                                      to={`/teacher/assignments/${ass._id}/submissions`}
                                      className="tz-tl-ass-grade-btn"
                                      title="Chấm bài"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <IconCheckSquare /> Chấm bài
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal: Thêm / Sửa Chương */}
        {showSecModal && (
          <div className="tz-tl-modal-overlay">
            <div className="tz-tl-modal">
              <div className="tz-tl-modal-header">
                <h2>{secModalMode === "edit" ? "Sửa Chương" : "Thêm Chương Mới"}</h2>
                <button onClick={() => setShowSecModal(false)} className="tz-tl-modal-close">&times;</button>
              </div>
              <form onSubmit={handleSaveSection} className="tz-tl-modal-body">
                <div className="tz-tl-form-group">
                  <label>Tên chương</label>
                  <input type="text" required value={secTitle} onChange={e => setSecTitle(e.target.value)} placeholder="Nhập tên chương..." />
                </div>
                <button type="submit" className="tz-tl-btn-primary full-width">
                  {secModalMode === "edit" ? "Lưu Thay Đổi" : "Lưu Chương Học"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Thêm / Sửa Bài Học */}
        {showLessonModal && (
          <div className="tz-tl-modal-overlay">
            <div className="tz-tl-modal">
              <div className="tz-tl-modal-header">
                <h2>{lessonModalMode === "edit" ? "Sửa Bài Học" : "Thêm Bài Học Mới"}</h2>
                <button onClick={() => setShowLessonModal(false)} className="tz-tl-modal-close">&times;</button>
              </div>
              <form onSubmit={handleSaveLesson} className="tz-tl-modal-body">
                <div className="tz-tl-form-group">
                  <label>Tên bài học</label>
                  <input type="text" required value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder="Nhập tên bài học..." />
                </div>
                <div className="tz-tl-checkbox-group">
                  <label>
                    <input type="checkbox" checked={isFreePreview} onChange={e => setIsFreePreview(e.target.checked)} />
                    <span className="checkbox-text">Cho phép học thử miễn phí (Trial)</span>
                  </label>
                </div>
                <button type="submit" className="tz-tl-btn-primary full-width">
                  {lessonModalMode === "edit" ? "Lưu Thay Đổi" : "Lưu Bài Học"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Quản lý tài liệu */}
        {showMaterialsModal && (
          <div className="tz-tl-modal-overlay">
            <div className="tz-tl-modal modal-large">
              <div className="tz-tl-modal-header">
                <h2>Quản lý tài liệu bài học</h2>
                <button onClick={() => setShowMaterialsModal(false)} className="tz-tl-modal-close">&times;</button>
              </div>
              <div className="tz-tl-modal-body">
                {activeLesson?.materials?.length > 0 ? (
                  <div className="tz-tl-material-list">
                    <h3 className="tz-tl-material-list-title">Tài liệu đã tải lên</h3>
                    {activeLesson.materials.map((mat) => (
                      <div key={mat._id} className="tz-tl-material-item">
                        {editingMaterialId === mat._id ? (
                          <form onSubmit={handleSaveMaterialEdit} className="tz-tl-material-edit-form">
                            <div className="tz-tl-form-group">
                              <label>Tên hiển thị</label>
                              <input
                                type="text"
                                required
                                value={editMaterialTitle}
                                onChange={(e) => setEditMaterialTitle(e.target.value)}
                              />
                            </div>
                            <div className="tz-tl-form-group">
                              <label>Thay file mới (tùy chọn)</label>
                              <input type="file" onChange={(e) => setEditMaterialFile(e.target.files[0] || null)} />
                            </div>
                            <div className="tz-tl-material-edit-actions">
                              <button type="button" className="tz-tl-btn-outline-sm" onClick={cancelMaterialEdit}>Hủy</button>
                              <button type="submit" className="tz-tl-btn-primary-sm">Lưu thay đổi</button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="tz-tl-material-info">
                              <IconFileText />
                              <span className="tz-tl-material-name">{mat.title || "Tài liệu"}</span>
                              {mat.kind === "video" && <span className="tz-tl-material-kind-tag">Video</span>}
                            </div>
                            <div className="tz-tl-material-actions">
                              <a
                                href={apiPath(mat.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="tz-tl-btn-outline-sm"
                                title="Xem / tải file"
                              >
                                <IconEye /> Xem
                              </a>
                              <button type="button" className="tz-tl-btn-outline-sm" onClick={() => startMaterialEdit(mat)}>
                                <IconEdit /> Sửa
                              </button>
                              <button type="button" className="tz-tl-btn-outline-sm danger" onClick={() => handleDeleteMaterial(mat._id)}>
                                <IconTrash /> Xóa
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="tz-tl-material-empty">Chưa có tài liệu nào. Thêm file mới bên dưới.</p>
                )}

                <form onSubmit={handleAddMaterial} className="tz-tl-material-add">
                  <h3 className="tz-tl-material-list-title">Thêm tài liệu mới</h3>
                  <div className="tz-tl-form-group">
                    <label>Loại</label>
                    <select
                      value={newMaterialKind}
                      onChange={(e) => {
                        setNewMaterialKind(e.target.value);
                        setNewMaterialFile(null);
                      }}
                    >
                      <option value="file">Tài liệu (PDF, slide, tệp...)</option>
                      <option value="video">Video ghi hình buổi học</option>
                    </select>
                  </div>
                  <div className="tz-tl-form-group">
                    <label>Tên hiển thị (tùy chọn)</label>
                    <input
                      type="text"
                      value={newMaterialTitle}
                      onChange={(e) => setNewMaterialTitle(e.target.value)}
                      placeholder={newMaterialKind === "video" ? "VD: Video buổi 5 — Part 3" : "VD: Slide bài 1, Giáo trình PDF..."}
                    />
                  </div>
                  <div className="tz-tl-form-group">
                    <label>
                      {newMaterialKind === "video"
                        ? "Chọn video buổi học (MP4, MOV, WEBM...)"
                        : "Chọn file (PDF, DOCX, ZIP...)"}
                    </label>
                    <div className="tz-tl-file-upload">
                      <input
                        type="file"
                        required
                        accept={newMaterialKind === "video" ? "video/*" : undefined}
                        onChange={(e) => setNewMaterialFile(e.target.files[0] || null)}
                      />
                    </div>
                    {newMaterialKind === "video" && (
                      <small className="tz-tl-material-hint">
                        Video dung lượng lớn có thể mất vài phút để tải lên. Vui lòng giữ cửa sổ mở cho đến khi hoàn tất.
                      </small>
                    )}
                  </div>
                  <button type="submit" className="tz-tl-btn-primary full-width">
                    {newMaterialKind === "video" ? "Tải lên video buổi học" : "Tải lên tài liệu"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Tạo Bài Tập */}
        {showAssignmentModal && (
          <div className="tz-tl-modal-overlay">
            <div className="tz-tl-modal modal-large">
              <div className="tz-tl-modal-header">
                <h2>{editingAssignmentId ? "Chỉnh sửa Bài Tập" : "Giao Bài Tập"}</h2>
                <button onClick={() => setShowAssignmentModal(false)} className="tz-tl-modal-close">&times;</button>
              </div>
              <form onSubmit={handleSaveAssignment} className="tz-tl-modal-body">
                <div className="tz-tl-form-row">
                  <div className="tz-tl-form-group half">
                    <label>Loại bài tập</label>
                    <select value={assignmentData.type} onChange={e => setAssignmentData({...assignmentData, type: e.target.value})} disabled={!!editingAssignmentId}>
                      <option value="essay">Tự luận (Học viên nộp text/file)</option>
                      <option value="quiz">Trắc nghiệm (Hệ thống chấm tự động)</option>
                    </select>
                  </div>
                  <div className="tz-tl-form-group half">
                    <label>Tiêu đề bài tập</label>
                    <input type="text" required value={assignmentData.title} onChange={e => setAssignmentData({...assignmentData, title: e.target.value})} placeholder="VD: Bài tập cuối khóa" />
                  </div>
                </div>
                
                {assignmentData.type === "essay" ? (
                  <div className="tz-tl-form-group">
                    <label>Mô tả đề bài / Yêu cầu</label>
                    <textarea 
                      rows="6" 
                      required 
                      value={assignmentData.description} 
                      onChange={e => setAssignmentData({...assignmentData, description: e.target.value})}
                      placeholder="Nhập yêu cầu chi tiết của bài tập..."
                    ></textarea>
                  </div>
                ) : (
                  <div className="tz-tl-quiz-builder">
                    <div className="tz-tl-qb-header">
                      <label>Danh sách Câu hỏi ({assignmentData.questions.length})</label>
                      <button type="button" className="tz-tl-btn-outline-sm" onClick={handleAddQuestion}>+ Thêm Câu Hỏi</button>
                    </div>
                    <div className="tz-tl-qb-list">
                      {assignmentData.questions.length === 0 ? (
                        <p className="tz-tl-qb-empty">Chưa có câu hỏi nào. Nhấn nút Thêm Câu Hỏi ở trên để bắt đầu.</p>
                      ) : (
                        assignmentData.questions.map((q, qIndex) => (
                          <div key={qIndex} className="tz-tl-qb-item">
                            <div className="tz-tl-qb-item-header">
                              <h4>Câu {qIndex + 1}</h4>
                              <button type="button" className="tz-tl-qb-remove" onClick={() => handleRemoveQuestion(qIndex)}>&times;</button>
                            </div>
                            <div className="tz-tl-form-group">
                              <input type="text" placeholder="Nhập nội dung câu hỏi..." value={q.questionText} required onChange={e => handleUpdateQuestion(qIndex, "questionText", e.target.value)} />
                            </div>
                            <div className="tz-tl-qb-options">
                              {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="tz-tl-qb-option">
                                  <input 
                                    type="radio" 
                                    name={`correct_${qIndex}`} 
                                    checked={q.correctAnswerIndex === oIndex} 
                                    onChange={() => handleUpdateQuestion(qIndex, "correctAnswerIndex", oIndex)} 
                                    required
                                    title="Chọn làm đáp án đúng"
                                  />
                                  <input 
                                    type="text" 
                                    placeholder={`Lựa chọn ${oIndex + 1}`} 
                                    value={opt} 
                                    required 
                                    onChange={e => {
                                      const newOpts = [...q.options];
                                      newOpts[oIndex] = e.target.value;
                                      handleUpdateQuestion(qIndex, "options", newOpts);
                                    }} 
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <button type="submit" className="tz-tl-btn-primary full-width" disabled={assignmentData.type === 'quiz' && assignmentData.questions.length === 0}>
                  {editingAssignmentId ? "Lưu Thay Đổi" : "Tạo Bài Tập"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
