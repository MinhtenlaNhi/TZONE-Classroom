/**
 * Lộ trình bài học CỐ ĐỊNH cho khóa "TOEIC Speaking & Writing" (slug danh mục: "toeic-sw").
 * Mỗi lần admin tạo khóa học mới thuộc danh mục này, các bài học dưới đây
 * sẽ được tạo sẵn tự động.
 *
 * - Khóa gồm 2 phần: 18 buổi Speaking + 10 buổi Writing.
 * - Mỗi phần tử là 1 "chương" (nhóm buổi), gồm sectionTitle và danh sách bài học.
 * - Thứ tự bài học trong mảng chính là thứ tự hiển thị.
 */
module.exports = [
  // ───────────────────────── SPEAKING (18 buổi) ─────────────────────────
  {
    sectionTitle: "Speaking · Buổi 1–5: Module 01 + 02",
    lessons: [
      "Đọc đoạn văn: Announcement – Guide – Intro (tranh chủ đề: park, road, beach, store, restaurant)",
      "Đọc đoạn văn: News – Automated message – Advertisement (tranh chủ đề: office, classroom, airport)",
      "Luyện đọc đoạn văn tổng hợp (tranh chủ đề: library, lab; tranh chỉ vật & các tranh khó)"
    ]
  },
  {
    sectionTitle: "Speaking · Buổi 6–10: Module 03",
    lessons: [
      "Internet – service – shopping",
      "Daily life 1",
      "Daily life 2",
      "Job & Work",
      "Practice"
    ]
  },
  {
    sectionTitle: "Speaking · Buổi 11–15: Module 05",
    lessons: [
      "Topic: At work (teamwork, communication, leadership, internship, trait to success)",
      "Topic: Business (advertising, startup, recruitment, work environment)",
      "Topic: At school (volunteer, fieldtrip, teacher, subject)",
      "Topic: Daily life (hobby, travelling, eating out, living area, role models)",
      "Topic: Daily life 2 (learning culture, talent, luck, technology)"
    ]
  },
  {
    sectionTitle: "Speaking · Buổi 15–16: Module 04",
    lessons: [
      "Practice Module 5 — Module 4: Conference schedule + Class schedule",
      "Practice Module 5 — Module 4: Interview schedule; Order form / Registration sheet"
    ]
  },
  {
    sectionTitle: "Speaking · Buổi 17–18: Full test",
    lessons: [
      "Luyện đề 1",
      "Luyện đề 2",
      "Luyện đề 3",
      "Luyện đề 4"
    ]
  },

  // ───────────────────────── WRITING (10 buổi) ─────────────────────────
  {
    sectionTitle: "Writing · Buổi 1",
    lessons: [
      "Phân biệt những mảng ngữ pháp hay nhầm lẫn",
      "Giới thiệu phần mô tả tranh + luyện tập"
    ]
  },
  {
    sectionTitle: "Writing · Buổi 2",
    lessons: [
      "Giới thiệu essay",
      "Cấu trúc chính của lập luận"
    ]
  },
  {
    sectionTitle: "Writing · Buổi 3",
    lessons: [
      "Học cách paraphrase + tổ chức bài viết",
      "Luyện tập viết lập luận theo chủ đề"
    ]
  },
  {
    sectionTitle: "Writing · Buổi 4",
    lessons: [
      "Cách tăng tính liên kết trong lập luận và câu từ",
      "Giới thiệu dạng bài",
      "Luyện tập cách viết mở – kết theo từng dạng bài"
    ]
  },
  {
    sectionTitle: "Writing · Buổi 5",
    lessons: [
      "Tính chính phụ trong bài viết",
      "Cách sử dụng hedging words",
      "Email"
    ]
  },
  {
    sectionTitle: "Writing · Buổi 6",
    lessons: [
      "Mock test essay",
      "GV viết mẫu dạng bài lợi ích – bất lợi",
      "Luyện tập viết và chữa emails"
    ]
  },
  {
    sectionTitle: "Writing · Buổi 7",
    lessons: [
      "Mock test essay",
      "GV viết mẫu dạng bài ý kiến theo 2 cách tiếp cận"
    ]
  },
  {
    sectionTitle: "Writing · Buổi 8",
    lessons: [
      "GV viết mẫu dạng bài đề mở",
      "Mock test tranh + email: chấm chữa trực tiếp"
    ]
  },
  {
    sectionTitle: "Writing · Buổi 9",
    lessons: [
      "Mock test essay",
      "Luyện tập tranh + email"
    ]
  },
  {
    sectionTitle: "Writing · Buổi 10",
    lessons: [
      "Full test – chữa trực tiếp phần tranh + email",
      "Tổng kết dạng bài và các lưu ý khi thi writing"
    ]
  }
];
