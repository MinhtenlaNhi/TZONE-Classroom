/** Danh mục khóa học (dùng cho dropdown + lọc) */
export const COURSE_CATEGORIES = [
  { id: "tap-su", label: "Tập sự" },
  { id: "toeic-a", label: "TOEIC A" },
  { id: "toeic-b", label: "TOEIC B" },
  { id: "toeic-sw", label: "TOEIC S+W" }
];

/** @typedef {{ col: number, startMin: number, endMin: number }} CourseSession */

/**
 * col: 0=Thứ 2 … 6=Chủ nhật. startMin/endMin: phút từ 0h.
 * @param {number[]} cols
 * @param {number} startMin
 * @param {number} endMin
 * @returns {CourseSession[]}
 */
function S(cols, startMin, endMin) {
  return cols.map((col) => ({ col, startMin, endMin }));
}

export const COURSE_IMG = [
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=640&h=360&fit=crop",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&h=360&fit=crop",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=640&h=360&fit=crop",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&h=360&fit=crop",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=640&h=360&fit=crop",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=640&h=360&fit=crop"
];

export const COURSES = [
  {
    id: "toeic-a-st15",
    categoryId: "toeic-a",
    badge: "KHÓA TOEIC A",
    title: "TOEIC A ST15",
    schedule: "Tối 2-4-6 | 18h-19h30",
    sessions: S([0, 2, 4], 18 * 60, 19 * 60 + 30),
    startDate: "5/7",
    enrolled: "10",
    capacity: "23",
    rating: 4.5,
    ratingLabel: "4.5k",
    price: "3.200.000đ",
    instructor: "Ms. Hà Trang"
  },
  {
    id: "tap-su-ts08",
    categoryId: "tap-su",
    badge: "KHÓA TẬP SỰ",
    title: "TẬP SỰ TS08",
    schedule: "Tối 3-5-7 | 19h-20h30",
    sessions: S([1, 3, 5], 19 * 60, 20 * 60 + 30),
    startDate: "12/7",
    enrolled: "8",
    capacity: "20",
    rating: 4.8,
    ratingLabel: "2.1k",
    price: "2.800.000đ",
    instructor: "Ms. Hà Trang"
  },
  {
    id: "toeic-a-st16",
    categoryId: "toeic-a",
    badge: "KHÓA TOEIC A",
    title: "TOEIC A ST16",
    schedule: "Sáng 2-4-6 | 8h-9h30",
    sessions: S([0, 2, 4], 8 * 60, 9 * 60 + 30),
    startDate: "20/7",
    enrolled: "15",
    capacity: "25",
    rating: 4.6,
    ratingLabel: "3.2k",
    price: "3.200.000đ",
    instructor: "Mr. Minh Tuấn"
  },
  {
    id: "toeic-b-tb02",
    categoryId: "toeic-b",
    badge: "KHÓA TOEIC B",
    title: "TOEIC B TB02",
    schedule: "Chiều 2-4-6 | 14h-15h30",
    sessions: S([0, 2, 4], 14 * 60, 15 * 60 + 30),
    startDate: "8/8",
    enrolled: "6",
    capacity: "18",
    rating: 4.4,
    ratingLabel: "1.8k",
    price: "3.500.000đ",
    instructor: "Ms. Lan Anh"
  },
  {
    id: "tap-su-ts09",
    categoryId: "tap-su",
    badge: "KHÓA TẬP SỰ",
    title: "TẬP SỰ TS09",
    schedule: "Tối 2-4-6 | 18h-19h30",
    sessions: S([0, 2, 4], 18 * 60, 19 * 60 + 30),
    startDate: "15/8",
    enrolled: "12",
    capacity: "22",
    rating: 4.7,
    ratingLabel: "900",
    price: "2.800.000đ",
    instructor: "Ms. Hà Trang"
  },
  {
    id: "toeic-sw-sw01",
    categoryId: "toeic-sw",
    badge: "KHÓA TOEIC SW",
    title: "TOEIC SW SW01",
    schedule: "Cuối tuần | 9h-11h",
    sessions: S([5, 6], 9 * 60, 11 * 60),
    startDate: "22/8",
    enrolled: "9",
    capacity: "15",
    rating: 4.9,
    ratingLabel: "650",
    price: "2.400.000đ",
    instructor: "Mr. Đức Anh"
  },
  /** Khóa mẫu trong mockup lịch: Thứ 3, 5, 7 — 20h–21h30 */
  {
    id: "tap-su-st35",
    categoryId: "tap-su",
    badge: "KHÓA TẬP SỰ",
    title: "Tập sự ST35",
    schedule: "Tối 3-5-7 | 20h-21h30",
    sessions: S([1, 3, 5], 20 * 60, 21 * 60 + 30),
    startDate: "5/4",
    enrolled: "23",
    capacity: "23",
    rating: 4.8,
    ratingLabel: "4.5k",
    price: "2.900.000đ",
    instructor: "Ms. Phương Anh"
  }
];

/** Danh sách gốc trong code (không gồm khóa tạo từ admin trên MongoDB). */
export const STATIC_COURSES = COURSES;

export function getCourseByIdFromList(list, id) {
  if (id == null || id === "") return null;
  const s = String(id);
  return list.find((c) => String(c.id) === s) || null;
}

export function getCoursesByIdsFromList(list, ids) {
  return ids.map((id) => getCourseByIdFromList(list, id)).filter(Boolean);
}

export function getCourseById(id) {
  return getCourseByIdFromList(COURSES, id);
}

export function getCoursesByIds(ids) {
  return getCoursesByIdsFromList(COURSES, ids);
}
