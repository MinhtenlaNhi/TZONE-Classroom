/**
 * Lộ trình bài học CỐ ĐỊNH cho khóa "Tập sự" (slug danh mục: "tap-su").
 * Mỗi lần admin tạo khóa học mới thuộc danh mục này, các bài học dưới đây
 * sẽ được tạo sẵn tự động (chia theo tuần).
 *
 * - Mỗi phần tử là 1 "chương" (tuần học), gồm sectionTitle và danh sách bài học.
 * - Thứ tự bài học trong mảng chính là thứ tự hiển thị.
 */
module.exports = [
  {
    sectionTitle: "Tuần 1",
    lessons: [
      "Ngữ âm: Nguyên âm đơn",
      "Ngữ âm: Nguyên âm đôi + Phụ âm cơ bản",
      "Ngữ âm: Phụ âm nâng cao"
    ]
  },
  {
    sectionTitle: "Tuần 2",
    lessons: [
      "Part 1: Luyện nghe tả Tranh chỉ người (1)",
      "Part 1: Luyện nghe tả Tranh chỉ người (2)",
      "Part 2: Tổng quan Part 2 & Luyện nghe hiểu câu hỏi Who"
    ]
  },
  {
    sectionTitle: "Tuần 3",
    lessons: [
      "Part 2: Luyện nghe hiểu nhóm câu hỏi: Where + When",
      "Part 2: Luyện nghe hiểu câu trả lời của nhóm câu hỏi: What/Which",
      "Part 2: Luyện nghe hiểu câu trả lời của nhóm câu hỏi: Why + How"
    ]
  },
  {
    sectionTitle: "Tuần 4",
    lessons: [
      "Part 2: Luyện nghe hiểu câu trả lời của nhóm câu hỏi: Nghi vấn (Yes/No, Lựa chọn, Đuôi)",
      "Part 2: Luyện nghe hiểu câu trả lời của nhóm câu: Trần thuật",
      "Final Test"
    ]
  }
];
