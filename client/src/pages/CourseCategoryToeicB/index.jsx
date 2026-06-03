import { useState } from "react";
import CoursePageHeader from "../../components/CoursePageHeader";
import "../CourseCategoryTapSu/styles.css";

function IconDoc() {
  return (
    <svg className="tap-su-accordion__icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg className="tap-su-card__clock" width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const syllabusItems = [
  {
    id: "p1",
    title: "Buổi 1 – Buổi 3: Luyện tập Part 1",
    bullets: ["Tranh tả người", "Tranh tả vật", "Tranh hỗn hợp"]
  },
  { id: "p2", title: "Buổi 4 – 8: Luyện tập Part 2", detail: null },
  {
    id: "p3",
    title: "Buổi 9 – 19: Luyện tập Part 3 + Ngữ pháp Part 5 – 6",
    detail: null
  },
  {
    id: "p4",
    title: "Buổi 20 – 26: Luyện tập Part 4 + Ngữ pháp Part 5–6 + Luyện đề",
    detail: null
  },
  { id: "final", title: "Buổi 27 – Final test", detail: null }
];

export default function CourseCategoryToeicBPage({ embedded = false }) {
  const [openId, setOpenId] = useState("p1");

  return (
    <div className={embedded ? "tap-su-page tap-su-page--embedded" : "tap-su-page"}>
      {!embedded && <CoursePageHeader />}

      <main className="tap-su-page__main">
        <h2 className="tap-su-page__hero-title">LỚP TOEIC B</h2>

        <div className="tap-su-overview">
          <article className="tap-su-card">
            <p className="tap-su-card__lead">
              Dành cho học viên đã hoàn thành <strong>TOEIC A</strong> hoặc có điểm từ{" "}
              <strong>550+</strong>.
            </p>
            <p className="tap-su-card__text">
              Khóa tập trung nâng cao <strong>Reading &amp; từ vựng</strong>, đồng thời củng cố và
              phát triển đồng đều <strong>bốn kỹ năng</strong> theo định dạng đề thi.
            </p>
          </article>

          <article className="tap-su-card">
            <p className="tap-su-card__stat">Thời lượng: 27 buổi</p>
            <ul className="tap-su-card__list">
              <li>Tập trung phần Reading</li>
              <li>Tập trung mở rộng từ vựng</li>
              <li>Hoàn thiện toàn diện các kỹ năng</li>
            </ul>
          </article>

          <article className="tap-su-card">
            <div className="tap-su-card__schedule-head">
              <IconClock />
              <div>
                <p className="tap-su-card__stat" style={{ marginBottom: 4 }}>
                  3 buổi / tuần
                </p>
                <p className="tap-su-card__text">1 giờ 30 phút / buổi</p>
              </div>
            </div>
            <p className="tap-su-card__text">
              Ca 1: <strong>18:00 – 19:30</strong> · Ca 2: <strong>20:00 – 21:30</strong>
            </p>
            <p className="tap-su-card__sub">
              Tối thứ 2 – 4 – 6 hoặc 3 – 5 – 7 (tùy lớp).
            </p>
            <p className="tap-su-card__sub">
              <strong>20 – 23 học viên</strong> / lớp.
            </p>
          </article>
        </div>

        <section
          className="tap-su-syllabus tap-su-syllabus--centered"
          aria-labelledby="toeic-b-syllabus-title"
        >
          <h3 id="toeic-b-syllabus-title" className="tap-su-syllabus__title">
            Nội dung các buổi học
          </h3>
          <div className="tap-su-accordion">
            {syllabusItems.map((item) => {
              const expanded = openId === item.id;
              return (
                <div key={item.id} className="tap-su-accordion__item">
                  <button
                    type="button"
                    className="tap-su-accordion__trigger"
                    aria-expanded={expanded}
                    onClick={() => setOpenId(expanded ? "" : item.id)}
                  >
                    <span className="tap-su-accordion__left">
                      <IconDoc />
                      <span>{item.title}</span>
                    </span>
                    <span className="tap-su-accordion__chev" aria-hidden>
                      ▼
                    </span>
                  </button>
                  {expanded ? (
                    <div className="tap-su-accordion__panel">
                      {item.bullets ? (
                        <ul className="tap-su-accordion__bullets">
                          {item.bullets.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      ) : item.detail ? (
                        item.detail
                      ) : (
                        <span className="tap-su-accordion__placeholder">
                          Chi tiết theo giáo trình từng buổi học.
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
