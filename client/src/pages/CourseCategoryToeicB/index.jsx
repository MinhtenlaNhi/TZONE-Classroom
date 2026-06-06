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
    id: "ch1",
    title: "Buổi 1 – 3: Chương 1 — Luyện tập Part 1+2",
    bullets: [
      "Bài 1: Luyện tập Part 1",
      "Bài 2: Part 2 nâng cao (1)",
      "Bài 3: Part 2 nâng cao (2)"
    ]
  },
  {
    id: "ch2",
    title: "Buổi 4 – 8: Chương 2 — Luyện tập Part 3+4",
    bullets: [
      "Bài 1: Ôn luyện Part 3+4",
      "Bài 2: Các dạng câu hỏi nâng cao (1)",
      "Bài 3: Các dạng câu hỏi nâng cao (2)",
      "Bài 4: Luyện và chữa đề Listening (1)",
      "Bài 5: Luyện và chữa đề Listening (2)"
    ]
  },
  {
    id: "ch3",
    title: "Buổi 9 – 19: Chương 3 — Luyện tập Part 5+6+7",
    bullets: [
      "Bài 1: Ôn luyện ngữ pháp (1)",
      "Bài 2: Ôn luyện ngữ pháp (2)",
      "Bài 3: Các dạng câu hỏi nâng cao (1)",
      "Bài 4: Các dạng câu hỏi nâng cao (2)",
      "Bài 5: Luyện tập Part 5",
      "Bài 6: Chủ đề nâng cao Part 6+7 (1)",
      "Bài 7: Chủ đề nâng cao Part 6+7 (2)",
      "Bài 8: Luyện và chữa đề Reading (1)",
      "Bài 9: Luyện và chữa đề Reading (2)",
      "Bài 10: Luyện và chữa đề Reading (3)",
      "Bài 11: Luyện và chữa đề Reading (4)"
    ]
  },
  {
    id: "ch4",
    title: "Buổi 20 – 25: Chương 4 — Luyện và chữa đề · Kiểm tra cuối khóa",
    bullets: [
      "Bài 1: Luyện và chữa đề (1)",
      "Bài 2: Luyện và chữa đề (2)",
      "Bài 3: Luyện và chữa đề (3)",
      "Bài 4: Luyện và chữa đề (4)",
      "Bài 5: Luyện và chữa đề (5)",
      "Bài 6: Bài kiểm tra cuối khóa"
    ]
  }
];

export default function CourseCategoryToeicBPage({ embedded = false }) {
  const [openId, setOpenId] = useState("ch1");

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
              phát triển đồng đều <strong>bốn kỹ năng</strong> theo định dạng đề thi. Mục tiêu đầu ra{" "}
              <strong>650–800+</strong>.
            </p>
            <p className="tap-su-card__text" style={{ marginTop: 12 }}>
              Học phí: <strong>3.500.000đ</strong>
            </p>
          </article>

          <article className="tap-su-card">
            <p className="tap-su-card__stat">Thời lượng: 25 buổi</p>
            <ul className="tap-su-card__list">
              <li>Tập trung phần Reading &amp; từ vựng nâng cao</li>
              <li>Luyện đề Listening &amp; Reading theo chương</li>
              <li>Kết thúc bằng bài kiểm tra cuối khóa</li>
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
                      <ul className="tap-su-accordion__bullets">
                        {item.bullets.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
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
