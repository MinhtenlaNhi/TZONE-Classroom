const Category = require("../models/Category");
const Lesson = require("../models/Lesson");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const tapSuCurriculum = require("../data/tapSuCurriculum");
const toeicACurriculum = require("../data/toeicACurriculum");
const toeicBCurriculum = require("../data/toeicBCurriculum");
const toeicSwCurriculum = require("../data/toeicSwCurriculum");

/** Map slug danh mục -> template lộ trình bài học cố định. */
const CURRICULUM_BY_SLUG = {
  "tap-su": tapSuCurriculum,
  "toeic-a": toeicACurriculum,
  "toeic-b": toeicBCurriculum,
  "toeic-sw": toeicSwCurriculum
};

function countTemplateLessons(template) {
  return template.reduce((sum, section) => sum + (section.lessons?.length || 0), 0);
}

function getExpectedLessonTitles(template) {
  const titles = [];
  template.forEach((section) => {
    (section.lessons || []).forEach((title) => titles.push(title));
  });
  return titles;
}

async function resolveCategorySlug(course) {
  if (!course) return null;

  if (course.categoryRef) {
    const category = await Category.findById(course.categoryRef).select("slug").lean();
    if (category?.slug) return category.slug;
  }

  if (course.categoryId && CURRICULUM_BY_SLUG[course.categoryId]) {
    return course.categoryId;
  }

  return null;
}

function buildLessonDocsFromTemplate(courseId, template) {
  const docs = [];

  template.forEach((section, sectionIdx) => {
    const sectionIndex = sectionIdx + 1;

    docs.push({
      courseRef: courseId,
      sectionIndex,
      sectionTitle: section.sectionTitle,
      title: section.sectionTitle,
      order: 0,
      isSectionPlaceholder: true
    });

    (section.lessons || []).forEach((title, lessonIdx) => {
      docs.push({
        courseRef: courseId,
        sectionIndex,
        sectionTitle: section.sectionTitle,
        title,
        order: lessonIdx + 1
      });
    });
  });

  return docs;
}

function curriculumMatchesTemplate(existingLessons, template) {
  const expectedTitles = getExpectedLessonTitles(template);
  const actualTitles = existingLessons
    .filter((lesson) => !lesson.isSectionPlaceholder)
    .sort((a, b) => a.sectionIndex - b.sectionIndex || a.order - b.order)
    .map((lesson) => lesson.title);

  if (actualTitles.length !== expectedTitles.length) return false;
  return actualTitles.every((title, idx) => title === expectedTitles[idx]);
}

async function clearCourseCurriculum(courseId) {
  const assignmentIds = await Assignment.find({ courseRef: courseId }).distinct("_id");
  if (assignmentIds.length) {
    await Submission.deleteMany({ assignmentRef: { $in: assignmentIds } });
    await Assignment.deleteMany({ _id: { $in: assignmentIds } });
  }
  await Lesson.deleteMany({ courseRef: courseId });
}

/**
 * Tạo hoặc đồng bộ lộ trình bài học cố định cho khóa thuộc danh mục có template.
 *
 * - Phát hiện danh mục qua categoryRef hoặc categoryId (slug).
 * - Tạo mới nếu chưa có bài học.
 * - Tự sửa nếu số bài / tên bài không khớp template (vd: khóa toeic-b chỉ có vài bài tạm).
 *
 * @param {object} course Document khóa học (có _id, categoryRef/categoryId).
 * @returns {Promise<number>} Số bản ghi Lesson đã tạo.
 */
async function seedCurriculumForCourse(course) {
  if (!course?._id) return 0;

  const slug = await resolveCategorySlug(course);
  if (!slug) return 0;

  const template = CURRICULUM_BY_SLUG[slug];
  if (!template?.length) return 0;

  const existingLessons = await Lesson.find({ courseRef: course._id })
    .sort({ sectionIndex: 1, order: 1 })
    .lean();

  if (existingLessons.length > 0 && curriculumMatchesTemplate(existingLessons, template)) {
    return 0;
  }

  if (existingLessons.length > 0) {
    await clearCourseCurriculum(course._id);
  }

  const docs = buildLessonDocsFromTemplate(course._id, template);
  if (!docs.length) return 0;

  await Lesson.insertMany(docs);
  return docs.length;
}

module.exports = {
  seedCurriculumForCourse,
  CURRICULUM_BY_SLUG,
  countTemplateLessons,
  resolveCategorySlug
};
