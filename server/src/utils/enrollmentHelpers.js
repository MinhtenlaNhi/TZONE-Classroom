const Course = require("../models/Course");

/** Gắn thông tin khóa học đầy đủ vào danh sách enrollment (tránh populate null). */
async function attachCoursesToEnrollments(enrollmentRows) {
  if (!Array.isArray(enrollmentRows) || enrollmentRows.length === 0) {
    return [];
  }

  const courseRefs = enrollmentRows.map((row) => row.course).filter(Boolean);
  if (!courseRefs.length) return [];

  const courses = await Course.find({ _id: { $in: courseRefs } })
    .select(
      "id title thumbnail instructor schedule totalSessions sessionDuration sessions startDate categoryId categoryRef"
    )
    .populate("categoryRef", "name")
    .lean();

  const courseById = new Map(courses.map((c) => [String(c._id), c]));

  return enrollmentRows
    .map((row) => ({
      ...row,
      progress: Number(row.progress) || 0,
      course: courseById.get(String(row.course)) || null
    }))
    .filter((row) => row.course);
}

module.exports = { attachCoursesToEnrollments };
