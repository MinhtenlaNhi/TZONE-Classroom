import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiFetchJson, apiPath } from "../../api/base";
import CourseCategoryTapSuPage from "../CourseCategoryTapSu";
import CourseCategoryToeicAPage from "../CourseCategoryToeicA";
import CourseCategoryToeicBPage from "../CourseCategoryToeicB";
import CourseCategoryToeicSWPage from "../CourseCategoryToeicSW";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import { getEnrollmentStatus, getEnrollmentClosedButtonLabel } from "../../utils/enrollment";

/**
 * Ưu tiên khóa "đang mở" và "sắp mở" (chưa đóng đăng ký) lên trước,
 * sắp xếp theo ngày mở bán (enrollmentOpenDate) tăng dần. Khóa đã đóng xuống cuối.
 */
function sortByEnrollmentPriority(list, now = new Date()) {
  const keyOf = (c) => {
    const open = c.enrollmentOpenDate ? new Date(c.enrollmentOpenDate) : null;
    const close = c.enrollmentCloseDate ? new Date(c.enrollmentCloseDate) : null;
    const isClosed = close && now > close;
    return {
      tier: isClosed ? 1 : 0, // 0 = đang mở / sắp mở, 1 = đã đóng
      openTime: open ? open.getTime() : 0 // null = đã mở từ trước → sớm nhất
    };
  };
  return [...list].sort((a, b) => {
    const ka = keyOf(a);
    const kb = keyOf(b);
    if (ka.tier !== kb.tier) return ka.tier - kb.tier;
    return ka.openTime - kb.openTime;
  });
}
import "./styles.css";

// SVG Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
);
const DocumentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const QuestionIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);
const UserGroupIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

// Benefit Icons
const IconBenefitTeacher = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const IconBenefitRoute = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6"></path></svg>
);
const IconBenefitVideo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
);
const IconBenefitBank = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

const benefitItems = [
  { title: "Giảng viên TOEIC 900+", subtitle: "Đội ngũ giàu kinh nghiệm", Icon: IconBenefitTeacher },
  { title: "Lộ trình cá nhân hóa", subtitle: "Học đúng trọng tâm, dễ đạt điểm cao", Icon: IconBenefitRoute },
  { title: "200+ Video bài giảng", subtitle: "Học online mọi lúc, mọi nơi", Icon: IconBenefitVideo },
  { title: "Ngân hàng đề thi lớn", subtitle: "Cập nhật đề mới mỗi tuần", Icon: IconBenefitBank }
];

const categories = [
  { label: "TẬP SỰ", id: "tap-su", desc: "Khóa học dành cho người mới bắt đầu", icon: "🚀" },
  { label: "TOEIC A", id: "toeic-a", desc: "Luyện thi TOEIC 0 - 500+", icon: "📘" },
  { label: "TOEIC B", id: "toeic-b", desc: "Luyện thi TOEIC 500 - 750+", icon: "💼" },
  { label: "TOEIC S+W", id: "toeic-sw", desc: "Luyện kỹ năng Speaking & Writing", icon: "💬" }
];

const courses = [
  {
    id: 1, levelLabel: "Tập sự", title: "Tập sự A01", schedule: "Tối 3-5-7 | 20h-21h30", price: "2.500.000đ",
    startDate: "07/05", instructor: { name: "Ms. Phương Anh", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" },
    image: "/images/course-team-collab.png"
  },
  {
    id: 2, levelLabel: "TOEIC A", title: "TOEIC A ST15", schedule: "Tối 2-4-6 | 18h-19h30", price: "3.200.000đ",
    startDate: "08/05", instructor: { name: "Ms. Thu Linh", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80" },
    image: "/images/course-library-student.png"
  },
  {
    id: 3, levelLabel: "TOEIC B", title: "TOEIC B S17", schedule: "Tối 3-5-7 | 17h30-19h30", price: "3.500.000đ",
    startDate: "10/05", instructor: { name: "Ms. Minh Hạnh", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=120&q=80" },
    image: "/images/course-group-study.png"
  },
  {
    id: 4, levelLabel: "TOEIC S+W", title: "TOEIC SW S18", schedule: "Tối 2-4-6 | 19h-20h30", price: "3.500.000đ",
    startDate: "13/05", instructor: { name: "Ms. Gia Hân", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" },
    image: "/images/course-team-collab.png"
  }
];

const teachers = [
  { name: "Ms. Thu Linh", score: "TOEIC 985/990", rating: 4.9, desc: "5 năm kinh nghiệm luyện thi TOEIC. Đào tạo hơn 2000+ học viên đạt 700+ TOEIC.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=420&q=80" },
  { name: "Ms. Huyền My", score: "TOEIC 970/990", rating: 4.8, desc: "Chuyên gia luyện Listening & Reading. Phương pháp dễ hiểu thực chiến.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=420&q=80" },
  { name: "Ms. Minh Hạnh", score: "TOEIC 990/990", rating: 5.0, desc: "Giảng viên TOEIC 990 tuyệt đối. Đào tạo nhiều thế hệ học viên đạt 800+.", image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=420&q=80" }
];

function reviewAvatarUrl(userRef) {
  const raw = userRef?.avatar || userRef?.googlePicture;
  if (!raw) return null;
  return raw.startsWith("http") ? raw : apiPath(raw);
}

function formatReviewClassInfo(courseRef) {
  if (!courseRef?.title) return "Khóa học TZONE";
  if (courseRef.startDate) {
    return `Lớp ${courseRef.title} — Khai giảng ${courseRef.startDate}`;
  }
  return `Khóa ${courseRef.title}`;
}

export default function HomePage() {
  const location = useLocation();
  const categoryDetailRef = useRef(null);
  const [openCategoryId, setOpenCategoryId] = useState("tap-su"); // Default open
  const [dbCourses, setDbCourses] = useState([]);
  const [dbTeachers, setDbTeachers] = useState([]);
  const [showAllTeachers, setShowAllTeachers] = useState(false);
  const [dbReviews, setDbReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    // Lấy nhiều khóa để có thể ưu tiên theo ngày mở bán phía client (chỉ hiển thị 4).
    apiFetchJson('/api/courses?limit=50&sort=createdAt_desc')
      .then(res => {
        if (res.success && res.courses && res.courses.length > 0) {
          setDbCourses(res.courses);
        }
      })
      .catch(console.error);

    // Fetch teachers
    apiFetchJson('/api/instructors')
      .then(res => {
        if (res.success && res.instructors && res.instructors.length > 0) {
          setDbTeachers(res.instructors);
        }
      })
      .catch(console.error);

    apiFetchJson("/api/reviews/latest")
      .then((res) => {
        if (res.success && Array.isArray(res.reviews)) {
          setDbReviews(res.reviews);
        }
      })
      .catch(console.error)
      .finally(() => setReviewsLoading(false));
  }, []);

  useEffect(() => {
    const raw = location.hash || (typeof window !== "undefined" ? window.location.hash : "");
    const hash = raw.replace(/^#/, "");
    if (!hash) return;
    const t = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash]);

  // Use DB courses if available, otherwise fallback to hardcoded mockup courses
  const displayCourses = dbCourses.length > 0 ? dbCourses.map(c => ({
    id: c._id || c.id,
    levelLabel: c.categoryRef?.name || c.categoryId || "Khóa học",
    title: c.title,
    schedule: c.schedule || "Linh hoạt",
    duration: c.duration || "2 tháng",
    sessions: c.totalSessions ? `${c.totalSessions} buổi` : "24 buổi",
    price: c.price ? (c.price.toString().includes('đ') ? c.price : `${Number(c.price).toLocaleString()}đ`) : "2.500.000đ",
    startDate: c.startDate || "10/06/2024",
    enrollmentOpenDate: c.enrollmentOpenDate,
    enrollmentCloseDate: c.enrollmentCloseDate,
    instructor: { 
      name: c.instructor || "TZONE", 
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" 
    },
    image: c.thumbnail ? apiPath(c.thumbnail) : "/images/course-team-collab.png"
  })) : courses;

  // Ưu tiên khóa đang mở / sắp mở (theo ngày mở bán) rồi chỉ hiển thị 4 khóa.
  const upcomingCourses = sortByEnrollmentPriority(displayCourses).slice(0, 4);

  const mapTeacher = (t) => ({
    id: t.id,
    name: t.name,
    score: "Giảng viên chuyên môn",
    rating: 5.0,
    desc: `Đồng hành cùng học viên tại TZONE (${t.teacherCode})`,
    image: t.avatar ? apiPath(t.avatar) : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=420&q=80"
  });
  // Toàn bộ giảng viên của trung tâm; phần "tiêu biểu" chỉ lấy 3 người đầu.
  const allTeachers = dbTeachers.length > 0 ? dbTeachers.map(mapTeacher) : teachers;
  const displayTeachers = allTeachers.slice(0, 3);

  const displayReviews = dbReviews.map((r) => ({
    id: r._id,
    quote: r.comment ? `"${r.comment}"` : "",
    name: r.userRef?.name || "Học viên",
    classInfo: formatReviewClassInfo(r.courseRef),
    avatar: reviewAvatarUrl(r.userRef),
    rating: r.rating || 5
  }));

  return (
    <main id="top" className="tz-home">
      <PublicHeader />

      {/* Hero Section */}
      <section className="tz-hero">
        <div className="tz-hero-container">
          <div className="tz-hero-content">
            <span className="tz-hero-badge">KHÓA HỌC TOEIC</span>
            <h1 className="tz-hero-title">Chinh Phục TOEIC <br/><span className="tz-text-green">800+</span></h1>
            <p className="tz-hero-subtitle">
              20+ Bộ đề TOEIC chuẩn luyện thi hiệu quả nhất hiện nay
            </p>
            
            <div className="tz-hero-stats">
              <div className="tz-hs-item">
                <div className="tz-hs-icon"><DocumentIcon /></div>
                <div className="tz-hs-text"><strong>20+</strong><span>Bộ đề</span></div>
              </div>
              <div className="tz-hs-item">
                <div className="tz-hs-icon"><QuestionIcon /></div>
                <div className="tz-hs-text"><strong>1000+</strong><span>Câu hỏi</span></div>
              </div>
              <div className="tz-hs-item">
                <div className="tz-hs-icon"><IconBenefitVideo /></div>
                <div className="tz-hs-text"><strong>200+</strong><span>Video bài giảng</span></div>
              </div>
              <div className="tz-hs-item">
                <div className="tz-hs-icon"><UserGroupIcon /></div>
                <div className="tz-hs-text"><strong>10.000+</strong><span>Học viên</span></div>
              </div>
            </div>

            <ul className="tz-hero-features">
              <li><CheckIcon /> Bám sát cấu trúc đề thi TOEIC mới nhất</li>
              <li><CheckIcon /> Lộ trình học thông minh - Cá nhân hóa theo mục tiêu</li>
              <li><CheckIcon /> Thực hành với kho đề phong phú, cập nhật liên tục</li>
              <li><CheckIcon /> Giải thích chi tiết - Hướng dẫn từ A đến Z</li>
            </ul>

            <div className="tz-hero-actions">
              <Link to="/courses" className="tz-btn-primary">Đăng ký học ngay</Link>
            </div>
          </div>
          
          <div className="tz-hero-visual">
            <img src="/images/hero-banner.png" alt="Student learning" className="tz-hero-img" />
            
            {/* Floating Cards */}
            <div className="tz-float-card tz-fc-score">
              <small>Điểm trung bình học viên</small>
              <strong>785+</strong>
              <svg className="tz-sparkline" width="60" height="20" viewBox="0 0 60 20"><path d="M0 15L10 12L20 16L30 8L40 10L50 2L60 6" stroke="#10b981" strokeWidth="2" fill="none"/></svg>
            </div>
            
            <div className="tz-float-card tz-fc-students">
              <small>Học viên đã đạt 800+</small>
              <strong>1.250+</strong>
              <div className="tz-avatars">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&q=80" alt="Avatar"/>
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&q=80" alt="Avatar"/>
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&q=80" alt="Avatar"/>
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&q=80" alt="Avatar"/>
              </div>
            </div>

            <div className="tz-float-card tz-fc-rating">
              <div className="tz-rating-top">
                <strong>⭐ 4.8/5</strong>
              </div>
              <div className="tz-rating-stars">★★★★★</div>
              <small>(2.350 đánh giá)</small>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <div className="tz-benefits-bar">
        <div className="tz-benefits-container">
          {benefitItems.map((item, idx) => (
            <div className="tz-benefit-item" key={idx}>
              <div className="tz-benefit-icon"><item.Icon /></div>
              <div className="tz-benefit-text">
                <h4>{item.title}</h4>
                <p>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section id="danh-muc-khoa-hoc" className="tz-section tz-categories">
        <div className="tz-section-header">
          <h2 className="tz-title-with-bar">DANH MỤC KHÓA HỌC</h2>
          <div className="tz-nav-arrows">
            <button className="tz-nav-arrow-btn">&lt;</button>
            <button className="tz-nav-arrow-btn">&gt;</button>
          </div>
        </div>

        <div className="tz-category-tabs">
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              className={`tz-cat-tab ${openCategoryId === cat.id ? 'active' : ''}`}
              onClick={() => setOpenCategoryId(cat.id)}
            >
              <div className="tz-cat-icon">{cat.icon}</div>
              <div className="tz-cat-info">
                <h4>{cat.label}</h4>
                <p>{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="tz-category-detail-container" ref={categoryDetailRef}>
          {openCategoryId === "tap-su" && <CourseCategoryTapSuPage embedded />}
          {openCategoryId === "toeic-a" && <CourseCategoryToeicAPage embedded />}
          {openCategoryId === "toeic-b" && <CourseCategoryToeicBPage embedded />}
          {openCategoryId === "toeic-sw" && <CourseCategoryToeicSWPage embedded />}
        </div>
      </section>

      {/* Upcoming Courses */}
      <section id="khoa-hoc-sap-khai-giang" className="tz-section tz-upcoming">
        <div className="tz-section-header">
          <h2 className="tz-title-with-bar">KHÓA HỌC SẮP KHAI GIẢNG</h2>
          <Link to="/courses" className="tz-link-more">Xem tất cả &gt;</Link>
        </div>

        <div className="tz-course-cards">
          {upcomingCourses.map(c => {
            const enrollmentStatus = getEnrollmentStatus(c);
            return (
            <div className="tz-course-card" key={c.id}>
              <div className="tz-cc-img-wrap">
                <img src={c.image} alt={c.title} />
                <span className="tz-cc-badge">{c.levelLabel}</span>
                <span className={`tz-cc-enroll-badge tz-cc-enroll-badge--${enrollmentStatus.badgeVariant}`}>
                  {enrollmentStatus.badge}
                </span>
              </div>
              <div className="tz-cc-content">
                <h3 className="tz-cc-title">{c.title}</h3>
                
                <div className="tz-cc-startdate">
                  <span>Khai giảng: {c.startDate}</span>
                </div>

                {enrollmentStatus.message ? (
                  <div className="tz-cc-enroll-note">{enrollmentStatus.message}</div>
                ) : null}

                <div className="tz-cc-info-grid">
                  <div><ClockIcon/> {c.duration}</div>
                  <div><CalendarIcon/> {c.sessions}</div>
                </div>

                <div className="tz-cc-bottom">
                  <div className="tz-cc-instructor">
                    <img src={c.instructor.avatar} alt={c.instructor.name} />
                    <span>{c.instructor.name}</span>
                  </div>
                  <div className="tz-cc-price">{c.price}</div>
                </div>
                
                {enrollmentStatus.isOpen ? (
                  <Link to={`/courses/${c.id}`} className="tz-btn-enroll" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'}}>Đăng ký ngay</Link>
                ) : (
                  <Link to={`/courses/${c.id}`} className="tz-btn-enroll tz-btn-enroll--closed" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'}}>
                    {getEnrollmentClosedButtonLabel(enrollmentStatus)}
                  </Link>
                )}
              </div>
            </div>
          )})}
        </div>
      </section>

      {/* Teachers */}
      <section id="giang-vien-tieu-bieu" className="tz-section tz-teachers">
        <div className="tz-section-header">
          <h2 className="tz-title-with-bar">GIẢNG VIÊN TIÊU BIỂU</h2>
          <button type="button" className="tz-link-more tz-link-more--btn" onClick={() => setShowAllTeachers(true)}>
            Xem tất cả &gt;
          </button>
        </div>
        
        <div className="tz-teacher-grid">
          {displayTeachers.map(t => (
            <div className="tz-teacher-card" key={t.id || t.name}>
              <img src={t.image} alt={t.name} className="tz-tc-avatar" />
              <div className="tz-tc-info">
                <h3>{t.name}</h3>
                <span className="tz-tc-score">{t.score}</span>
                <div className="tz-tc-rating">
                  <span className="stars">★★★★★</span> {t.rating}
                </div>
                <p className="tz-tc-desc">{t.desc}</p>
              </div>
              <button className="tz-nav-btn sm">&gt;</button>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section id="danh-gia" className="tz-section tz-reviews">
        <div className="tz-section-header">
          <h2 className="tz-title-with-bar">ĐÁNH GIÁ TỪ HỌC VIÊN</h2>
          <a href="#all-reviews" className="tz-link-more">Xem tất cả &gt;</a>
        </div>

        {reviewsLoading ? (
          <p className="tz-reviews-empty">Đang tải đánh giá...</p>
        ) : displayReviews.length === 0 ? (
          <p className="tz-reviews-empty">Chưa có đánh giá nào từ học viên.</p>
        ) : (
          <div className="tz-review-grid">
            {displayReviews.map((r) => (
              <div className="tz-review-card" key={r.id}>
                <div className="tz-rc-stars">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
                {r.quote && <p className="tz-rc-quote">{r.quote}</p>}
                <div className="tz-rc-author">
                  <img
                    src={r.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}`}
                    alt={r.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}`;
                    }}
                  />
                  <div>
                    <strong>{r.name}</strong>
                    <span>{r.classInfo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal: toàn bộ giảng viên của trung tâm */}
      {showAllTeachers && (
        <div className="tz-teachers-modal-overlay" onClick={() => setShowAllTeachers(false)}>
          <div className="tz-teachers-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tz-teachers-modal-head">
              <div className="tz-teachers-modal-head-text">
                <h3>Đội ngũ giảng viên TZONE</h3>
                <p>{allTeachers.length} giảng viên đang đồng hành cùng học viên</p>
              </div>
              <button
                type="button"
                className="tz-teachers-modal-close"
                onClick={() => setShowAllTeachers(false)}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
            <div className="tz-teachers-modal-grid">
              {allTeachers.map((t) => (
                <div className="tz-teacher-pro-card" key={t.id || t.name}>
                  <div className="tz-tpc-avatar-wrap">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="tz-tpc-avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?background=10b981&color=fff&name=${encodeURIComponent(t.name)}`;
                      }}
                    />
                  </div>
                  <h4 className="tz-tpc-name">{t.name}</h4>
                  <span className="tz-tpc-badge">{t.score}</span>
                  <div className="tz-tpc-rating">
                    <span className="tz-tpc-stars">★★★★★</span>
                    <span className="tz-tpc-rating-num">{t.rating.toFixed(1)}</span>
                  </div>
                  <p className="tz-tpc-desc">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </main>
  );
}
