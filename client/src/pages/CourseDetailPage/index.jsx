import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { fetchCourseLinks } from "../../api/courseLinks";
import { isCourseEnrolled } from "../../auth/enrolledCoursesStorage";
import { COL_LABELS, addDays, formatDayDM, formatSessionTime, getCourseSessionsForDate, isSessionLiveOnDate, startOfWeekMonday } from "../../utils/courseSchedule";
import { useCourses } from "../../context/CoursesContext";
import "./CourseDetailPage.css";

const TABS = [
  { id: "schedule", label: "Lịch học", icon: "cal" },
  { id: "members", label: "Thành viên", icon: "people" },
  { id: "materials", label: "Tài liệu", icon: "doc" },
  { id: "assignments", label: "Bài tập", icon: "task" }
];

function IconCal({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconPeople({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconDoc({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 2v6h6M10 13h8M10 17h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconTask({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

const ICONS = { cal: IconCal, people: IconPeople, doc: IconDoc, task: IconTask };

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { getCourseById, coursesLoaded } = useCourses();
  const course = courseId ? getCourseById(courseId) : null;
  const [tab, setTab] = useState("schedule");
  const [weekOffset, setWeekOffset] = useState(0);
  const [linksErr, setLinksErr] = useState(null);
  const [courseMeetUrl, setCourseMeetUrl] = useState("");
  const [, setTick] = useState(0);

  const loadLinks = useCallback(async () => {
    if (!courseId) return;
    try {
      setLinksErr(null);
      const data = await fetchCourseLinks(courseId);
      setCourseMeetUrl(data.meetUrl || "");
    } catch (e) {
      setLinksErr(e.message);
      setCourseMeetUrl("");
    }
  }, [courseId]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const { weekLabel, columns } = useMemo(() => {
    const base = new Date();
    const mon = startOfWeekMonday(base);
    mon.setDate(mon.getDate() + weekOffset * 7);
    const sun = addDays(mon, 6);
    const y = mon.getFullYear();
    const label = `Tuần ${formatDayDM(mon)} - ${formatDayDM(sun)}, ${y}`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cols = [];
    for (let col = 0; col < 7; col++) {
      const d = addDays(mon, col);
      d.setHours(0, 0, 0, 0);
      const isToday = d.getTime() === today.getTime();
      const name = COL_LABELS[col];
      const header = isToday ? `${name} - Hôm nay ${formatDayDM(d)}` : `${name} ${formatDayDM(d)}`;
      cols.push({ col, header, date: d });
    }
    return { weekLabel: label, columns: cols };
  }, [weekOffset]);

  if (!coursesLoaded) {
    return (
      <div className="cdp">
        <p>Đang tải khóa học…</p>
        <Link to="/my-courses">Quay lại</Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="cdp">
        <p>Không tìm thấy khóa học.</p>
        <Link to="/my-courses">Quay lại</Link>
      </div>
    );
  }

  if (!isCourseEnrolled(course.id)) {
    return <Navigate to="/my-courses" replace />;
  }

  return (
    <div className="cdp">
      <div className="cdp__layout">
        <aside className="cdp__sidebar">
          <h2 className="cdp__course-title">{course.title}</h2>
          <p className="cdp__instructor">
            <span className="cdp__instructor-label">Giảng viên:</span>
            <span className="cdp__instructor-name">{course.instructor}</span>
          </p>
          <nav className="cdp__nav" aria-label="Danh mục khóa học">
            {TABS.map((t) => {
              const Ico = ICONS[t.icon];
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`cdp__nav-item ${tab === t.id ? "cdp__nav-item--active" : ""}`}
                  onClick={() => setTab(t.id)}
                >
                  <Ico className="cdp__nav-ico" />
                  {t.label}
                </button>
              );
            })}
          </nav>
          <Link className="cdp__back" to="/my-courses">
            ← Các khóa học của bạn
          </Link>
        </aside>

        <div className="cdp__main">
          {tab === "schedule" && (
            <div className="cdp__panel">
              <h3 className="cdp__panel-title visually-hidden">Lịch học</h3>
              {linksErr ? (
                <p className="cdp__warn" role="status">
                  {linksErr} — bạn vẫn xem được lịch; link lớp cần API hoạt động.
                </p>
              ) : null}

              <div className="cdp__week-nav">
                <button type="button" className="cdp__week-btn" aria-label="Tuần trước" onClick={() => setWeekOffset((w) => w - 1)}>
                  <ChevronLeft />
                </button>
                <span className="cdp__week-label">{weekLabel}</span>
                <button type="button" className="cdp__week-btn" aria-label="Tuần sau" onClick={() => setWeekOffset((w) => w + 1)}>
                  <ChevronRight />
                </button>
              </div>

              <div className="cdp__grid" role="grid" aria-label="Lịch học theo tuần">
                {columns.map(({ col, header, date }) => {
                  const daySessions = getCourseSessionsForDate(course, date);
                  return (
                    <div key={col} className="cdp__col">
                      <div className="cdp__col-head">{header}</div>
                      <div className="cdp__col-body">
                        {daySessions.map((s, i) => {
                          const live = isSessionLiveOnDate(date, s);
                          const url = live ? courseMeetUrl : null;
                          return (
                            <div key={`${s.col}-${s.startMin}-${i}`} className="cdp__slot">
                              <div className="cdp__slot-title">{course.title}</div>
                              <div className="cdp__slot-time">{formatSessionTime(s)}</div>
                              {live && url ? (
                                <a className="cdp__live-link" href={url} target="_blank" rel="noopener noreferrer">
                                  Vào lớp học trực tuyến
                                </a>
                              ) : live && !url ? (
                                <span className="cdp__live-pending">Đang đến giờ học — giảng viên chưa gửi link</span>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="cdp__hint">
                Link lớp chỉ hiện đúng <strong>ngày và giờ buổi học</strong>. Giáo viên cập nhật link cố định cho khóa tại mục{" "}
                <Link to="/teacher/course-links">Gửi link lớp học</Link>.
              </p>
            </div>
          )}

          {tab === "members" && (
            <div className="cdp__panel">
              <h3 className="cdp__panel-title">Thành viên</h3>
              <ul className="cdp__list">
                <li>
                  <strong>Giảng viên:</strong> {course.instructor}
                </li>
                <li>
                  <strong>Sĩ số:</strong> {course.enrolled}/{course.capacity} học viên
                </li>
                <li className="cdp__muted">Danh sách học viên chi tiết sẽ được kết nối backend sau.</li>
              </ul>
            </div>
          )}

          {tab === "materials" && (
            <div className="cdp__panel">
              <h3 className="cdp__panel-title">Tài liệu</h3>
              <ul className="cdp__list cdp__files">
                <li>📄 Giáo trình buổi 1 (đang cập nhật)</li>
                <li>📄 Bài đọc bổ trợ (đang cập nhật)</li>
              </ul>
              <p className="cdp__muted">Giảng viên sẽ đăng tài liệu tại đây trong phiên bản tiếp theo.</p>
            </div>
          )}

          {tab === "assignments" && (
            <div className="cdp__panel">
              <h3 className="cdp__panel-title">Bài tập</h3>
              <ul className="cdp__list">
                <li>Bài tập tuần 1 — hạn nộp: (đang cập nhật)</li>
                <li>Bài tập tuần 2 — hạn nộp: (đang cập nhật)</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
