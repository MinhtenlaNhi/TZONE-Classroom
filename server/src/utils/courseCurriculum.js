const Category = require("../models/Category");
const Lesson = require("../models/Lesson");
const tapSuCurriculum = require("../data/tapSuCurriculum");
const toeicACurriculum = require("../data/toeicACurriculum");
const toeicSwCurriculum = require("../data/toeicSwCurriculum");

/** Map slug danh mục -> template lộ trình bài học cố định. */
const CURRICULUM_BY_SLUG = {
  "tap-su": tapSuCurriculum,
  "toeic-a": toeicACurriculum,
  "toeic-sw": toeicSwCurriculum
};

/**
 * Tạo sẵn lộ trình bài học cố định cho khóa học nếu danh mục có template.
 * Hiện áp dụng cho danh mục "tap-su".
 *
 * - Phát hiện danh mục qua course.categoryRef -> Category.slug (đáng tin cậy hơn categoryId).
 * - Bỏ qua nếu khóa đã có bài học (tránh tạo trùng).
 *
 * @param {object} course Document khóa học vừa tạo (có _id, categoryRef).
 * @returns {Promise<number>} Số bản ghi Lesson đã tạo.
 */
async function seedCurriculumForCourse(course) {
  if (!course || !course.categoryRef) return 0;

  const category = await Category.findById(course.categoryRef).select("slug").lean();
  if (!category) return 0;

  const template = CURRICULUM_BY_SLUG[category.slug];
  if (!template || !template.length) return 0;

  const existing = await Lesson.countDocuments({ courseRef: course._id });
  if (existing > 0) return 0;

  const docs = [];
  template.forEach((section, sectionIdx) => {
    const sectionIndex = sectionIdx + 1;

    // Bản ghi placeholder lưu metadata chương (không hiển thị như bài học thật).
    docs.push({
      courseRef: course._id,
      sectionIndex,
      sectionTitle: section.sectionTitle,
      title: section.sectionTitle,
      order: 0,
      isSectionPlaceholder: true
    });

    (section.lessons || []).forEach((title, lessonIdx) => {
      docs.push({
        courseRef: course._id,
        sectionIndex,
        sectionTitle: section.sectionTitle,
        title,
        order: lessonIdx + 1
      });
    });
  });

  if (!docs.length) return 0;
  await Lesson.insertMany(docs);
  return docs.length;
}

module.exports = { seedCurriculumForCourse, CURRICULUM_BY_SLUG };
