/**
 * Lộ trình bài học CỐ ĐỊNH cho khóa "TOEIC A" (slug danh mục: "toeic-a").
 * Mỗi lần admin tạo khóa học mới thuộc danh mục này, các bài học dưới đây
 * sẽ được tạo sẵn tự động (chia theo chương/nhóm buổi học).
 *
 * - Mỗi phần tử là 1 "chương", gồm sectionTitle và danh sách bài học.
 * - Mỗi bài học ứng với 1 buổi học, đánh số liên tục từ 1 đến 27.
 * - Thứ tự bài học trong mảng chính là thứ tự hiển thị.
 */
module.exports = [
  {
    sectionTitle: "Part 1 – Mô tả tranh (Buổi 1–3)",
    lessons: [
      "Buổi 1: Part 1 – Tranh tả người: nhận diện hành động & trạng thái",
      "Buổi 2: Part 1 – Tranh tả vật & cảnh: vị trí, đặc điểm, bố cục",
      "Buổi 3: Part 1 – Tranh hỗn hợp: phân biệt người, vật và bối cảnh"
    ]
  },
  {
    sectionTitle: "Part 2 – Hỏi đáp (Buổi 4–8)",
    lessons: [
      "Buổi 4: Part 2 – Tổng quan & câu hỏi lấy thông tin (Who, What)",
      "Buổi 5: Part 2 – Câu hỏi lấy thông tin (When, Where, Why, How)",
      "Buổi 6: Part 2 – Câu hỏi xác nhận thông tin (Yes/No)",
      "Buổi 7: Part 2 – Câu hỏi lựa chọn & câu hỏi đuôi",
      "Buổi 8: Part 2 – Câu trần thuật & luyện tập tổng hợp"
    ]
  },
  {
    sectionTitle: "Part 3 & Ngữ pháp Part 5–6 (Buổi 9–19)",
    lessons: [
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
    sectionTitle: "Part 4 & Luyện đề (Buổi 20–26)",
    lessons: [
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
    sectionTitle: "Final Test (Buổi 27)",
    lessons: [
      "Buổi 27: Bài kiểm tra cuối khóa (Final Test)"
    ]
  }
];
