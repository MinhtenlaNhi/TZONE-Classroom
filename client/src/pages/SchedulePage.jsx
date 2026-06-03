import { useEffect, useMemo, useState } from "react";
import { fetchMyEnrollments } from "../api/enrollmentsApi";
import { COL_LABELS, addDays, formatDayDM, formatSessionTime, getCourseSessionsForDate, startOfWeekMonday, jsDayToCol } from "../utils/courseSchedule";
import { getVisibleEnrollments } from "../utils/enrollments";
import "./SchedulePage.css";

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

function isSameCalendarDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function SchedulePage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState("week"); // "week" | "month"
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetchMyEnrollments().then(res => {
      if (res.success) {
        setEnrollments(res.enrollments);
      }
      setLoading(false);
    });
  }, []);

  const enrolledCourses = useMemo(() => {
    return getVisibleEnrollments(enrollments).map((e) => e.course);
  }, [enrollments]);

  // Tính toán dữ liệu tuần
  const weekData = useMemo(() => {
    const base = new Date();
    const mon = startOfWeekMonday(base);
    mon.setDate(mon.getDate() + offset * 7);
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
      const header = isToday ? `${name} - Hôm nay / ${formatDayDM(d)}` : `${name} / ${formatDayDM(d)}`;
      cols.push({ col, header, date: d });
    }
    return { label, columns: cols };
  }, [offset]);

  // Tính toán dữ liệu tháng
  const monthData = useMemo(() => {
    const base = new Date();
    base.setMonth(base.getMonth() + offset);
    base.setDate(1);
    const month = base.getMonth();
    const year = base.getFullYear();
    const label = `Tháng ${month + 1}, ${year}`;

    const firstCol = jsDayToCol(base);
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstCol; i++) {
      days.push({ empty: true, key: `empty-start-${i}` });
    }
    for (let d = 1; d <= lastDay; d++) {
      const dateObj = new Date(year, month, d);
      days.push({ 
        empty: false, 
        date: d,
        dateObj,
        col: jsDayToCol(dateObj),
        key: `day-${d}`,
        isToday: isSameCalendarDay(dateObj, new Date())
      });
    }
    const remainder = days.length % 7;
    if (remainder > 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        days.push({ empty: true, key: `empty-end-${i}` });
      }
    }
    return { label, days };
  }, [offset]);

  const getSessionsForDate = (date) => {
    const items = [];
    for (const course of enrolledCourses) {
      for (const s of getCourseSessionsForDate(course, date)) {
        items.push({
          title: course.title,
          timeStr: formatSessionTime(s)
        });
      }
    }
    return items;
  };

  const handlePrev = () => setOffset(o => o - 1);
  const handleNext = () => setOffset(o => o + 1);

  if (loading) {
    return <div style={{padding: '40px', textAlign: 'center'}}>Đang tải lịch học...</div>;
  }

  return (
    <div className="schedule-page">
      <div className="schedule-page__header-actions">
        <h1 className="schedule-page__title visually-hidden">Lịch học</h1>
        
        <div className="schedule-page__view-toggle">
          <button 
            className={`tz-toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => { setViewMode('week'); setOffset(0); }}
          >Tuần</button>
          <button 
            className={`tz-toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => { setViewMode('month'); setOffset(0); }}
          >Tháng</button>
        </div>
      </div>

      <div className="schedule-page__week-nav">
        <button type="button" className="schedule-page__week-btn" onClick={handlePrev}>
          <ChevronLeft />
        </button>
        <span className="schedule-page__week-label">
          {viewMode === "week" ? weekData.label : monthData.label}
        </span>
        <button type="button" className="schedule-page__week-btn" onClick={handleNext}>
          <ChevronRight />
        </button>
      </div>

      {enrolledCourses.length === 0 ? (
        <p className="schedule-page__empty">
          Bạn không có khóa nào đang học. Đăng ký khóa ở Tổng quan hoặc xem mục Các khóa học của bạn.
        </p>
      ) : (
        viewMode === "week" ? (
          <div className="schedule-page__grid" role="grid" aria-label="Lịch học theo tuần">
            {weekData.columns.map(({ col, header, date }) => (
              <div key={col} className="schedule-page__col" role="columnheader">
                <div className="schedule-page__col-head">{header}</div>
                <div className="schedule-page__col-body">
                  {getSessionsForDate(date).map((item, i) => (
                    <div key={`${item.title}-${i}`} className="schedule-page__slot">
                      <div className="schedule-page__slot-title">{item.title}</div>
                      <div className="schedule-page__slot-time">{item.timeStr}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="schedule-page__month-grid">
            <div className="schedule-page__month-header">
              {COL_LABELS.map(name => (
                <div key={name} className="schedule-page__month-header-cell">{name}</div>
              ))}
            </div>
            <div className="schedule-page__month-body">
              {monthData.days.map(day => (
                <div key={day.key} className={`schedule-page__month-cell ${day.empty ? 'empty' : ''} ${day.isToday ? 'today' : ''}`}>
                  {!day.empty && (
                    <>
                      <div className="schedule-page__month-date">{day.date}</div>
                      <div className="schedule-page__month-sessions">
                        {getSessionsForDate(day.dateObj).map((item, i) => (
                          <div key={i} className="schedule-page__month-slot">
                            <span className="time">{item.timeStr}</span>
                            <span className="title">{item.title}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
