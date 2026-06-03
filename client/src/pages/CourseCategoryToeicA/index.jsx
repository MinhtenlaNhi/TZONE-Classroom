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
    title: "Buổi 1 – 3: Luyện tập Part 1 (Mô tả tranh)",
    bullets: [
      "Buổi 1: Part 1 – Tranh tả người: nhận diện hành động & trạng thái",
      "Buổi 2: Part 1 – Tranh tả vật & cảnh: vị trí, đặc điểm, bố cục",
      "Buổi 3: Part 1 – Tranh hỗn hợp: phân biệt người, vật và bối cảnh"
    ]
  },
  {
    id: "p2",
    title: "Buổi 4 – 8: Luyện tập Part 2 (Hỏi đáp)",
    bullets: [
      "Buổi 4: Part 2 – Tổng quan & câu hỏi lấy thông tin (Who, What)",
      "Buổi 5: Part 2 – Câu hỏi lấy thông tin (When, Where, Why, How)",
      "Buổi 6: Part 2 – Câu hỏi xác nhận thông tin (Yes/No)",
      "Buổi 7: Part 2 – Câu hỏi lựa chọn & câu hỏi đuôi",
      "Buổi 8: Part 2 – Câu trần thuật & luyện tập tổng hợp"
    ]
  },
  {
    id: "p3",
    title: "Buổi 9 – 19: Luyện tập Part 3 + Ngữ pháp Part 5 – 6",
    bullets: [
      "Buổi 9: Part 3 – Tổng quan & chiến lược nghe hội thoại",
      "Buổi 10: Part 3 – Câu hỏi thông tin chung (chủ đề, mục đích, nơi chốn)",
      "Buổi 11: Part 3 – Câu hỏi chi tiết & suy luận",
      "Buổi 12: Part 3 – Câu hỏi hàm ý & kết hợp bảng biểu (graphic)",
      "Buổi 13: Part 3 – Luyện tập tổng hợp các dạng câu hỏi",
      "Buổi 14: Ngữ pháp – Từ loại: danh từ & đại từ",
      "Buổi 15: Ngữ pháp – Từ loại: tính từ & trạng từ",
      "Buổi 16: Ngữ pháp – Động từ & sự hòa hợp chủ – vị",
      "Buổi 17: Ngữ pháp – Thì và các dạng của động từ",
      "Buổi 18: Ngữ pháp – Mệnh đề quan hệ",
      "Buổi 19: Ngữ pháp – Liên từ & giới từ"
    ]
  },
  {
    id: "p4",
    title: "Buổi 20 – 26: Luyện tập Part 4 + Ngữ pháp Part 5–6 + Luyện đề",
    bullets: [
      "Buổi 20: Part 4 – Tổng quan & chiến lược nghe bài độc thoại",
      "Buổi 21: Part 4 – Các dạng câu hỏi thường gặp",
      "Buổi 22: Part 4 – Câu hỏi suy luận & kết hợp bảng biểu",
      "Buổi 23: Ngữ pháp – Các chủ điểm trọng tâm còn lại (so sánh, câu điều kiện…)",
      "Buổi 24: Reading – Part 5 & 6: vận dụng và mở rộng",
      "Buổi 25: Luyện đề – Hoàn thiện kỹ năng Nghe & Đọc",
      "Buổi 26: Luyện đề – Chữa đề chi tiết trên lớp"
    ]
  },
  {
    id: "final",
    title: "Buổi 27 – Final Test",
    bullets: ["Buổi 27: Bài kiểm tra cuối khóa (Final Test)"]
  }
];

export default function CourseCategoryToeicAPage({ embedded = false }) {
  const [openId, setOpenId] = useState("p1");

  return (
    <div className={embedded ? "tap-su-page tap-su-page--embedded" : "tap-su-page"}>
      {!embedded && <CoursePageHeader />}

      <main className="tap-su-page__main">
        <h2 className="tap-su-page__hero-title">LỚP TOEIC A</h2>

        <div className="tap-su-overview">
          <article className="tap-su-card">
            <p className="tap-su-card__lead">
              Dành cho học viên đã có nền tảng nhưng chưa học TOEIC hoặc điểm dưới 600.
            </p>
            <p className="tap-su-card__text">
              Lộ trình tập trung <strong>Listening</strong> (Part 1–4), <strong>ngữ pháp nền</strong>,{" "}
              <strong>Reading cơ bản</strong> và mở rộng vốn từ qua flashcard. Sử dụng tài liệu ETS chuẩn,
              mục tiêu đầu ra <strong>550+</strong>.
            </p>
          </article>

          <article className="tap-su-card">
            <p className="tap-su-card__stat">Thời lượng: 27 buổi</p>
            <ul className="tap-su-card__list">
              <li>Hoàn thiện toàn bộ các dạng Listening (Part 1–4)</li>
              <li>Hệ thống lại ngữ pháp nền</li>
              <li>Làm quen và làm chủ các dạng Reading cơ bản</li>
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

        <section className="tap-su-syllabus" aria-labelledby="toeic-a-syllabus-title">
          <h3 id="toeic-a-syllabus-title" className="tap-su-syllabus__title">
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
