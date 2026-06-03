const Submission = require("../models/Submission");

/** Chỉ bài nộp của tài khoản học viên (loại giáo viên / admin). */
async function findStudentSubmissions(filter, extraPopulate = []) {
  let query = Submission.find(filter)
    .populate({
      path: "studentRef",
      select: "name email avatar role",
      match: { role: "student" }
    })
    .sort({ createdAt: -1 });

  for (const pop of extraPopulate) {
    query = query.populate(pop);
  }

  const submissions = await query.lean();
  return submissions.filter((s) => s.studentRef);
}

module.exports = { findStudentSubmissions };
