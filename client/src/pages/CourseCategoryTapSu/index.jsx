import { useState } from "react";
import CoursePageHeader from "../../components/CoursePageHeader";
import "./styles.css";

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
    id: "w1",
    title: "Tuần 1: Ngữ âm – Phát âm nền tảng",
    lessons: [
      "Ngữ âm: Nguyên âm đơn",
      "Ngữ âm: Nguyên âm đôi + Phụ âm cơ bản",
      "Ngữ âm: Phụ âm nâng cao"
    ]
  },
  {
    id: "w2",
    title: "Tuần 2: Listening Part 1 & khởi động Part 2",
    lessons: [
      "Part 1: Luyện nghe tả tranh chỉ người (1)",
      "Part 1: Luyện nghe tả tranh chỉ người (2)",
      "Part 2: Tổng quan Part 2 & luyện nghe câu hỏi Who"
    ]
  },
  {
    id: "w3",
    title: "Tuần 3: Listening Part 2 – Nhóm câu hỏi Wh-",
    lessons: [
      "Part 2: Nhóm câu hỏi Where + When",
      "Part 2: Nhóm câu hỏi What / Which",
      "Part 2: Nhóm câu hỏi Why + How"
    ]
  },
  {
    id: "w4",
    title: "Tuần 4: Listening Part 2 nâng cao & kiểm tra cuối khóa",
    lessons: [
      "Part 2: Câu hỏi nghi vấn (Yes/No, lựa chọn, câu hỏi đuôi)",
      "Part 2: Câu trần thuật",
      "Bài kiểm tra cuối khóa (Final Test)"
    ]
  }
];

export default function CourseCategoryTapSuPage({ embedded = false }) {
  const [openId, setOpenId] = useState("w1");

  return (
    <div className={embedded ? "tap-su-page tap-su-page--embedded" : "tap-su-page"}>
      {!embedded && <CoursePageHeader />}

      <main className="tap-su-page__main">
        <h2 className="tap-su-page__hero-title">LỚP TẬP SỰ</h2>

        <div className="tap-su-overview">
          <article className="tap-su-card">
            <p className="tap-su-card__lead">
              Dành cho người mất gốc, nền tảng rất yếu, chưa nghe được các video tiếng Anh cơ bản và
              vốn từ còn hạn chế.
            </p>
            <p className="tap-su-card__text">
              Qua video và bài giảng, bạn phát triển kỹ năng nghe cơ bản, tích lũy từ vựng và nắm
              ngữ pháp nền. Khóa cung cấp khoảng <strong>500 từ vựng lõi</strong>.
            </p>
          </article>

          <article className="tap-su-card">
            <p className="tap-su-card__stat">Thời lượng: 4 tuần · 12 buổi</p>
            <p className="tap-su-card__text">Tuần 1 tập trung bổ trợ phát âm.</p>
            <ul className="tap-su-card__list">
              <li>Xây dựng kỹ năng nghe nền tảng (Listening Part 1 & 2)</li>
              <li>Luyện phát âm & tích lũy từ vựng</li>
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

        <section className="tap-su-syllabus" aria-labelledby="tap-su-syllabus-title">
          <h3 id="tap-su-syllabus-title" className="tap-su-syllabus__title">
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
                      <ul className="tap-su-accordion__lessons">
                        {item.lessons.map((lesson, idx) => (
                          <li key={idx}>{lesson}</li>
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
